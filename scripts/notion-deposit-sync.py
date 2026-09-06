#!/usr/bin/env python3
"""Read bank ledger, link receipts and allocate by cycle. Never write bank amounts.

Default is read-only planning. --apply enables authorized relation/status writes.
Credentials and raw snapshots stay outside Git. No messaging or calendar writes.
"""
import argparse
import datetime as dt
import fcntl
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from pathlib import Path
from zoneinfo import ZoneInfo

KST = ZoneInfo('Asia/Seoul')
VERSION = '2025-09-03'
KINDS = ('bank', 'stores', 'cycles', 'payments', 'allocations')
BANK_FIELDS = {'매장', '정산회차', '입금매칭', '매칭메모'}
RELATIONS = {'매장', '정산회차', '회차', '원장거래', '입금'}
SELECTS = {'입금매칭', '확인상태', '납부구분', '배분상태'}
TITLES = {'입금건', '배분건'}


def uid(value):
    return str(value).replace('-', '').split('?')[0].rsplit('/', 1)[-1]


def value(prop):
    kind = prop.get('type')
    item = prop.get(kind)
    if kind in ('title', 'rich_text'):
        return ''.join(x.get('plain_text', x.get('text', {}).get('content', '')) for x in item or [])
    if kind == 'relation':
        if prop.get('has_more'):
            raise ValueError('Relation has more than 25 items; refusing partial data')
        return [uid(x['id']) for x in item or []]
    if kind == 'select':
        return (item or {}).get('name', '')
    if kind == 'date':
        return (item or {}).get('start')
    if kind in ('formula', 'rollup'):
        return (item or {}).get((item or {}).get('type'))
    return item


def row(page):
    return {'id': uid(page['id']), 'created_time': page.get('created_time', ''),
            **{k: value(v) for k, v in page['properties'].items()}}


def day(raw):
    if not raw:
        return None
    parsed = dt.datetime.fromisoformat(raw.replace('Z', '+00:00'))
    return parsed.astimezone(KST).date() if parsed.tzinfo else parsed.date()


def amount(cycle):
    return sum(int(cycle.get(k) or 0) for k in ('용역 공급가', '용역 VAT', '광고비(VAT포함)'))


def normalize_payer(text):
    # Deliberately no fuzzy, substring, transliteration or punctuation matching.
    return re.sub(r'\s+', ' ', text or '').strip()


def duplicate_key(bank):
    raw = bank.get('거래ID') or ''
    if re.match(r'^\d{12}', raw):
        minute = raw[:12]
    else:
        parsed = dt.datetime.fromisoformat(bank['거래일시'].replace('Z', '+00:00'))
        minute = parsed.astimezone(KST).strftime('%Y%m%d%H%M') if parsed.tzinfo else parsed.strftime('%Y%m%d%H%M')
    return (minute, bank.get('구분'), bank.get('금액'), bank.get('잔액'), bank.get('계좌끝4') or '')


def allocate_value(received, planned, offset):
    return min(max(0, planned), max(0, received - offset))


def choose_auto(bank, store, cycles, paid, cutoff):
    """Full amount + exact payer + unique date window only. Partial is reviewed."""
    when = day(bank.get('거래일시'))
    if not when or when < dt.date.fromisoformat(cutoff) or store.get('운영상태') != '운영중':
        return []
    available = []
    for c in cycles:
        remaining = max(0, amount(c) - paid.get(c['id'], 0))
        start, end = day(c.get('작업시작일')), day(c.get('실제종료일') or c.get('종료일(ERP)'))
        if remaining > 0 and start and end and start - dt.timedelta(days=7) <= when <= end:
            available.append((c, remaining))
    exact = [(c, due) for c, due in available if due == bank['금액']]
    if len(exact) == 1:
        return [(exact[0][0]['id'], exact[0][1])]
    if len(exact) > 1 or not available:
        return []
    # Prepayment only when the entire remaining signed contract is funded.
    all_unpaid = [(c, max(0, amount(c) - paid.get(c['id'], 0))) for c in cycles]
    all_unpaid = [(c, due) for c, due in all_unpaid if due > 0]
    all_unpaid.sort(key=lambda item: (item[0].get('회차') or 0, item[0]['id']))
    if len(all_unpaid) > 1 and sum(due for _, due in all_unpaid) == bank['금액']:
        if all_unpaid[0][0]['id'] in {c['id'] for c, _ in available}:
            return [(c['id'], due) for c, due in all_unpaid]
    return []


def build_plan(data, config):
    stores = {s['id']: s for s in data['stores']}
    cycles = {c['id']: c for c in data['cycles']}
    payments_by_bank = {}
    for p in data['payments']:
        linked = p.get('원장거래') or []
        if len(linked) > 1:
            raise ValueError('Receipt must link exactly one bank transaction')
        key = linked[0] if linked else p.get('동기화키')
        if key:
            if key in payments_by_bank:
                raise ValueError('Duplicate management receipt key; manual review required')
            payments_by_bank[key] = p
    allocations_by_payment = defaultdict(list)
    for a in data['allocations']:
        if len(a.get('입금') or []) != 1 or len(a.get('회차') or []) != 1:
            raise ValueError('Allocation must have exactly one receipt and one cycle')
        allocations_by_payment[a['입금'][0]].append(a)
    aliases = defaultdict(set)
    for s in stores.values():
        for alias in (s.get('입금자명') or '').splitlines():
            if normalize_payer(alias):
                aliases[normalize_payer(alias)].add(s['id'])
    groups = defaultdict(list)
    for b in data['bank']:
        groups[duplicate_key(b)].append(b)
    duplicate_ids = set()
    for group in groups.values():
        if len(group) < 2:
            continue
        known = [b for b in group if payments_by_bank.get(b['id'], {}).get('확인상태') == '원장 대조']
        if len(known) > 1:
            raise ValueError('Two confirmed receipts for a duplicate bank transaction')
        canonical = known[0] if known else min(group, key=lambda b: (b['created_time'], b['id']))
        duplicate_ids.update(b['id'] for b in group if b['id'] != canonical['id'])
    plans, pending, paid = [], [], defaultdict(int)
    bank_ids = {b['id'] for b in data['bank']}

    for bank_id, p in payments_by_bank.items():
        if bank_id not in bank_ids:
            plans.append({'bank': None, 'payment': p, 'store': (p.get('매장') or [None])[0],
                          'status': '원장 없음', 'allocations': [], 'reason': '원장 거래 없음·보관 상태 확인'})

    for b in sorted(data['bank'], key=lambda b: (b.get('거래일시') or '', b['id'])):
        p = payments_by_bank.get(b['id'])
        if b['id'] in duplicate_ids or b.get('구분') != '입금' or b.get('입금매칭') == '제외':
            if p:
                plans.append({'bank': b, 'payment': p, 'store': (p.get('매장') or [None])[0],
                              'status': '매칭해제', 'allocations': [], 'reason': '중복·출금·제외 거래'})
            continue
        explicit = b.get('매장') or []
        matches = aliases.get(normalize_payer(b.get('상대/적요')), set())
        sid = explicit[0] if len(explicit) == 1 and explicit[0] in stores else None
        if sid is None and p and len(p.get('매장') or []) == 1:
            sid = p['매장'][0]
        if sid is None and len(matches) == 1:
            sid = next(iter(matches))
        if sid not in stores:
            continue  # Personal and unrelated bank activity is untouched.
        linked_cycles = b.get('정산회차') or []
        valid = bool(linked_cycles) and len(linked_cycles) == len(set(linked_cycles)) and all(
            cid in cycles and cycles[cid].get('매장') == [sid] and amount(cycles[cid]) > 0
            for cid in linked_cycles)
        trusted = b.get('입금매칭') == '수동확정' or (
            p is not None and p.get('확인상태') == '원장 대조'
            and b.get('입금매칭') == '자동확정' and sid in matches)
        result = {'bank': b, 'payment': p, 'store': sid, 'status': '매칭 확인필요',
                  'allocations': [], 'reason': '입금자 대조·회차 또는 금액 확인 필요'}
        if valid and trusted:
            prior = {a['회차'][0]: a for a in allocations_by_payment.get((p or {}).get('id'), [])}
            saved = dict(json.loads((p or {}).get('자동배분계획') or '[]'))
            if any(cid not in cycles or not isinstance(budget, (int, float)) or budget < 0
                   for cid, budget in saved.items()):
                raise ValueError('Invalid saved allocation recovery plan')
            ordered = sorted(linked_cycles, key=lambda cid: (cycles[cid].get('회차') or 0, cid))
            result['allocations'] = [(cid, min(amount(cycles[cid]), int(prior[cid]['배분예정액'])))
                                     if cid in prior else (cid, min(amount(cycles[cid]), int(saved.get(cid, amount(cycles[cid])))))
                                     for cid in ordered]
            result['status'], result['reason'] = '원장 대조', '원장과 확정 회차 연결 유지'
            offset = 0
            for cid, budget in result['allocations']:
                paid[cid] += allocate_value(int(b['금액']), budget, offset)
                offset += budget
            plans.append(result)
        else:
            pending.append(result)

    for plan in pending:
        b, sid = plan['bank'], plan['store']
        # A manually flagged candidate is never silently promoted.
        allow_auto = b.get('입금매칭') not in ('매장확인', '회차확인', '중복확인')
        allow_auto = allow_auto and (plan['payment'] is None or not plan['payment'].get('회차'))
        if allow_auto:
            eligible = [c for c in cycles.values() if c.get('매장') == [sid]]
            chosen = choose_auto(b, stores[sid], eligible, paid, config['auto_match_after'])
            if chosen:
                plan.update(status='원장 대조', allocations=chosen, reason='입금자 완전일치·금액·작업기간 유일 매칭')
                for cid, budget in chosen:
                    paid[cid] += budget
        plans.append(plan)
    # No cycle is allowed to be funded twice, even through two manual links.
    conflicts = {cid for cid, received in paid.items() if received > amount(cycles[cid])}
    for plan in plans:
        if any(cid in conflicts for cid, _ in plan['allocations']):
            plan.update(status='매칭 확인필요', allocations=[], reason='동일 회차의 중복 배분 확인 필요')
    return plans


def notion_props(values):
    props = {}
    for key, val in values.items():
        if key in RELATIONS:
            props[key] = {'relation': [{'id': v} for v in val]}
        elif key in SELECTS:
            props[key] = {'select': {'name': val} if val else None}
        elif key in TITLES:
            props[key] = {'title': [{'text': {'content': val}}]}
        elif key == '실제입금일':
            props[key] = {'date': {'start': val} if val else None}
        elif isinstance(val, (int, float)):
            props[key] = {'number': val}
        else:
            props[key] = {'rich_text': [{'text': {'content': val or ''}}]}
    return props


class Notion:
    def __init__(self, token):
        self.token, self.last_request = token, 0

    def request(self, method, path, body=None):
        for attempt in range(4):
            time.sleep(max(0, 0.36 - (time.monotonic() - self.last_request)))
            req = urllib.request.Request('https://api.notion.com/v1/' + path,
                data=json.dumps(body).encode() if body is not None else None, method=method,
                headers={'Authorization': 'Bearer ' + self.token, 'Notion-Version': VERSION, 'Content-Type': 'application/json'})
            self.last_request = time.monotonic()
            try:
                with urllib.request.urlopen(req, timeout=30) as response:
                    return json.load(response)
            except urllib.error.HTTPError as exc:
                if exc.code == 429 and attempt < 3:
                    time.sleep(min(30, int(exc.headers.get('Retry-After', 2))))
                    continue
                raise RuntimeError(f'Notion {method} {path}: HTTP {exc.code}') from None
            # Never blindly retry a create after timeout: next poll deduplicates by key.

    def query(self, ds):
        pages, cursor = [], None
        while True:
            result = self.request('POST', f'data_sources/{ds}/query',
                                  {'page_size': 100, **({'start_cursor': cursor} if cursor else {})})
            pages.extend(result['results'])
            if not result.get('has_more'):
                for page in pages:
                    for prop in page['properties'].values():
                        if prop.get('type') == 'relation' and prop.get('has_more'):
                            related, next_cursor = [], None
                            while True:
                                prop_id = urllib.parse.quote(urllib.parse.unquote(prop['id']), safe='')
                                path = f'pages/{page["id"]}/properties/{prop_id}?page_size=100'
                                if next_cursor:
                                    path += '&start_cursor=' + urllib.parse.quote(next_cursor, safe='')
                                full = self.request('GET', path)
                                related.extend(item['relation'] for item in full['results'])
                                if not full.get('has_more'):
                                    break
                                next_cursor = full['next_cursor']
                            prop['relation'], prop['has_more'] = related, False
                return pages
            cursor = result['next_cursor']


def update_if_changed(api, original, fields, kind, audit):
    if kind == 'bank' and not set(fields).issubset(BANK_FIELDS):
        raise ValueError('Bank write guard: amount/date/payer/content writes forbidden')
    changed = {k: v for k, v in fields.items() if original.get(k) != v}
    if changed:
        api.request('PATCH', 'pages/' + original['id'], {'properties': notion_props(changed)})
        audit.append({'kind': kind, 'id': original['id'], 'fields': list(changed)})


def apply_plan(api, data, config, plans):
    audit = []
    stores = {s['id']: s for s in data['stores']}
    cycles = {c['id']: c for c in data['cycles']}
    allocations = {a.get('동기화키'): a for a in data['allocations']}
    if len(allocations) != len(data['allocations']):
        raise ValueError('Allocation keys missing or duplicated')
    for plan in plans:
        bank, payment, sid = plan['bank'], plan['payment'], plan['store']
        if not bank:
            update_if_changed(api, payment, {'확인상태': '원장 없음'}, 'payment', audit)
            continue
        is_confirmed = plan['status'] == '원장 대조'
        # Pending candidates keep their existing links for review; status excludes sums.
        cids = [cid for cid, _ in plan['allocations']]
        if not is_confirmed and payment:
            cids = payment.get('회차') or []
        fields = {'매장': [sid], '원장거래': [bank['id']], '회차': cids,
                  '동기화키': bank['id'], '입금액': int(bank['금액']),
                  '자동배분계획': json.dumps(plan['allocations'], ensure_ascii=False) if is_confirmed else '[]',
                  '실제입금일': day(bank['거래일시']).isoformat(), '확인상태': plan['status'],
                  '납부구분': '선입금' if is_confirmed and len(cids) > 1 else '월 입금' if is_confirmed else '입금후보'}
        if is_confirmed:
            # Persist the matching decision first; interrupted receipt/allocation writes
            # are safely resumed by the next query using the bank ID and saved plan.
            update_if_changed(api, bank, {'매장': [sid], '정산회차': cids,
                '입금매칭': '수동확정' if bank.get('입금매칭') == '수동확정' else '자동확정',
                '매칭메모': plan['reason']}, 'bank', audit)
        if payment:
            update_if_changed(api, payment, fields, 'payment', audit)
        else:
            fields['입금건'] = stores[sid]['매장명'] + ' · ' + fields['실제입금일'] + ' 입금'
            created = api.request('POST', 'pages', {'parent': {'data_source_id': config['payments']}, 'properties': notion_props(fields)})
            payment = row(created)
            audit.append({'kind': 'payment_create', 'id': payment['id']})
        active_keys, offset = set(), 0
        for cid, budget in plan['allocations']:
            key = payment['id'] + ':' + cid
            active_keys.add(key)
            fields = {'입금': [payment['id']], '회차': [cid], '배분예정액': budget,
                      '선배분액': offset, '배분상태': '확정', '동기화키': key}
            if key in allocations:
                update_if_changed(api, allocations[key], fields, 'allocation', audit)
            else:
                fields['배분건'] = cycles[cid]['정산건'] + ' · 원장 배분'
                created = api.request('POST', 'pages', {'parent': {'data_source_id': config['allocations']}, 'properties': notion_props(fields)})
                audit.append({'kind': 'allocation_create', 'id': uid(created['id'])})
            offset += budget
        for a in data['allocations']:
            if a.get('입금') == [payment['id']] and a.get('동기화키') not in active_keys:
                status = '확인필요' if plan['status'] == '매칭 확인필요' else '제외'
                update_if_changed(api, a, {'배분상태': status}, 'allocation', audit)
        if not is_confirmed and bank.get('입금매칭') != '제외':
            # Do not assert a candidate payer/store link if identity was not verified.
            aliases = {normalize_payer(x) for x in (stores[sid].get('입금자명') or '').splitlines()}
            verified_payer = normalize_payer(bank.get('상대/적요')) in aliases
            pending_fields = {'입금매칭': '회차확인' if verified_payer else '매장확인', '매칭메모': plan['reason']}
            if verified_payer:
                pending_fields['매장'] = [sid]
            update_if_changed(api, bank, pending_fields, 'bank', audit)
    return audit


def write_json(path, payload):
    temp = path.with_suffix('.tmp')
    temp.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n')
    os.chmod(temp, 0o600)
    temp.replace(path)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--config', required=True)
    parser.add_argument('--token-file', required=True)
    parser.add_argument('--state-dir', required=True)
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    state = Path(args.state_dir)
    state.mkdir(parents=True, exist_ok=True)
    os.chmod(state, 0o700)
    with (state / 'sync.lock').open('w') as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            return 0
        now = dt.datetime.now(KST).isoformat(timespec='seconds')
        health_file = state / 'health.json'
        health = json.loads(health_file.read_text()) if health_file.exists() else {}
        try:
            config = json.loads(Path(args.config).read_text())
            api = Notion(Path(args.token_file).read_text().strip())
            raw = {kind: api.query(config[kind]) for kind in KINDS}
            data = {kind: [row(p) for p in pages] for kind, pages in raw.items()}
            write_json(state / 'latest-snapshot.json', raw)
            plans = build_plan(data, config)
            write_json(state / 'latest-plan.json', plans)
            audit = apply_plan(api, data, config, plans) if args.apply else []
            write_json(state / 'latest-audit.json', audit)
            if audit:
                with (state / 'audit.jsonl').open('a') as history:
                    history.write(json.dumps({'time': now, 'changes': audit}, ensure_ascii=False) + '\n')
                os.chmod(state / 'audit.jsonl', 0o600)
            health.update(last_checked=now, status='running' if args.apply else 'dry_run',
                          counts={k: len(v) for k, v in data.items()}, changes=len(audit), error=None)
            if args.apply:
                health['last_success'] = now
            write_json(health_file, health)
            if args.apply and config.get('health_page'):
                children = api.request('GET', 'blocks/' + config['health_page'] + '/children?page_size=100')
                health_block = next(b['id'] for b in children['results'] if b['type'] == 'paragraph')
                msg = f'마지막 원장 확인: {now} | 1분 간격 자동 연결 | 입금 후보 {sum(p["status"] != "원장 대조" for p in plans)}건 | 이번 변경 {len(audit)}건. Mac이 켜져 있고 네트워크에 연결된 동안 실행됩니다.'
                api.request('PATCH', 'blocks/' + health_block, {'paragraph': {'rich_text': [{'type': 'text', 'text': {'content': msg}}]}})
            print(json.dumps({k: health[k] for k in ('status', 'last_checked', 'changes')}, ensure_ascii=False))
            return 0
        except Exception as exc:
            # No response bodies, credentials, payer names or raw bank activity in logs.
            message = str(exc) if isinstance(exc, (RuntimeError, ValueError)) else type(exc).__name__
            health.update(last_attempt=now, status='needs_attention', error=message[:250])
            write_json(health_file, health)
            print(json.dumps({'status': 'needs_attention', 'error': message[:250]}, ensure_ascii=False))
            return 1


if __name__ == '__main__':
    sys.exit(main())
