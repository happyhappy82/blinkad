import copy
import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('deposit_sync', Path(__file__).parents[1] / 'scripts/notion-deposit-sync.py')
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)


def fixture():
    return {
        'stores': [{'id': 's1', '매장명': 'Sample store', '입금자명': 'Verified payer', '운영상태': '운영중'}],
        'cycles': [{'id': 'c1', '매장': ['s1'], '정산건': 'Sample 1', '회차': 1, '작업시작일': '2026-09-05',
                    '종료일(ERP)': '2026-10-04', '용역 공급가': 100, '용역 VAT': 10, '광고비(VAT포함)': 0}],
        'payments': [], 'allocations': [],
        'bank': [{'id': 'b1', 'created_time': '2026-09-06T01:01:00Z', '거래일시': '2026-09-06T01:00:00Z',
                  '거래ID': '202609061000|입금|110|1000', '상대/적요': 'Verified payer', '구분': '입금',
                  '금액': 110, '잔액': 1000}]
    }


def confirmed(data):
    data['bank'][0].update(매장=['s1'], 정산회차=['c1'], 입금매칭='자동확정')
    data['payments'] = [{'id': 'p1', '매장': ['s1'], '회차': ['c1'], '원장거래': ['b1'],
                         '확인상태': '원장 대조', '동기화키': 'b1'}]
    data['allocations'] = [{'id': 'a1', '입금': ['p1'], '회차': ['c1'], '배분예정액': 110,
                           '선배분액': 0, '배분상태': '확정', '동기화키': 'p1:c1'}]
    return data


class MatchingTests(unittest.TestCase):
    def plan(self, data):
        return sync.build_plan(data, {'auto_match_after': '2026-09-06'})

    def test_exact_unique_matches(self):
        plan = self.plan(fixture())[0]
        self.assertEqual(plan['status'], '원장 대조')
        self.assertEqual(plan['allocations'], [('c1', 110)])

    def test_partial_and_extra_money_require_review(self):
        for amount in (50, 111):
            data = fixture(); data['bank'][0]['금액'] = amount
            self.assertEqual(self.plan(data)[0]['status'], '매칭 확인필요')

    def test_two_same_price_cycles_are_ambiguous(self):
        data = fixture(); other = dict(data['cycles'][0], id='c2', 회차=2)
        data['cycles'].append(other)
        self.assertEqual(self.plan(data)[0]['status'], '매칭 확인필요')

    def test_no_fuzzy_payer_match_or_shared_alias(self):
        data = fixture(); data['bank'][0]['상대/적요'] = 'Verified payer extra'
        self.assertEqual(self.plan(data), [])
        data = fixture(); data['stores'].append(dict(data['stores'][0], id='s2'))
        self.assertEqual(self.plan(data), [])

    def test_historical_and_ended_store_not_auto_confirmed(self):
        data = fixture(); data['bank'][0]['거래일시'] = '2026-09-05T01:00:00Z'
        self.assertEqual(self.plan(data)[0]['status'], '매칭 확인필요')
        data = fixture(); data['stores'][0]['운영상태'] = '종료'
        self.assertEqual(self.plan(data)[0]['status'], '매칭 확인필요')

    def test_prepaid_multiple_cycles(self):
        data = fixture()
        data['cycles'].extend([dict(data['cycles'][0], id='c2', 회차=2, 작업시작일='2026-10-05', **{'종료일(ERP)': '2026-11-04'}),
                               dict(data['cycles'][0], id='c3', 회차=3, 작업시작일='2026-11-05', **{'종료일(ERP)': '2026-12-04'})])
        data['bank'][0]['금액'] = 330
        self.assertEqual(self.plan(data)[0]['allocations'], [('c1', 110), ('c2', 110), ('c3', 110)])
        self.assertEqual([sync.allocate_value(150, 110, i * 110) for i in range(3)], [110, 40, 0])

    def test_duplicate_bank_entry_only_funds_once(self):
        data = fixture(); data['bank'].append(dict(data['bank'][0], id='b2', created_time='2026-09-06T01:02:00Z'))
        plans = self.plan(data)
        self.assertEqual(len(plans), 1)
        self.assertEqual(plans[0]['bank']['id'], 'b1')

    def test_expense_exclusion_archive_and_payer_changes(self):
        for mutation in ('expense', 'excluded', 'archived', 'payer'):
            data = confirmed(fixture())
            if mutation == 'expense': data['bank'][0]['구분'] = '출금'
            if mutation == 'excluded': data['bank'][0]['입금매칭'] = '제외'
            if mutation == 'archived': data['bank'] = []
            if mutation == 'payer': data['bank'][0]['상대/적요'] = 'Unverified person'
            plan = self.plan(data)[0]
            self.assertNotEqual(plan['status'], '원장 대조')
            self.assertEqual(plan['allocations'], [])

    def test_manual_partial_payment(self):
        data = fixture(); data['bank'][0].update(금액=50, 매장=['s1'], 정산회차=['c1'], 입금매칭='수동확정')
        plan = self.plan(data)[0]
        self.assertEqual(plan['status'], '원장 대조')
        self.assertEqual(sync.allocate_value(50, plan['allocations'][0][1], 0), 50)

    def test_candidate_never_promoted_silently(self):
        data = fixture(); data['bank'][0]['입금매칭'] = '회차확인'
        self.assertEqual(self.plan(data)[0]['status'], '매칭 확인필요')

    def test_existing_paid_cycle_does_not_absorb_extra_payment(self):
        data = confirmed(fixture())
        data['bank'].append(dict(data['bank'][0], id='b2', 거래ID='202609061100|입금|110|1110', 잔액=1110,
                                 거래일시='2026-09-06T02:00:00Z', 매장=[], 정산회차=[], 입금매칭=''))
        plans = self.plan(data)
        self.assertEqual([p['status'] for p in plans], ['원장 대조', '매칭 확인필요'])

    def test_conflicting_manual_payments_are_quarantined(self):
        data = confirmed(fixture())
        data['bank'][0]['입금매칭'] = '수동확정'
        data['bank'].append(dict(data['bank'][0], id='b2', 거래ID='202609061100|입금|110|1110', 잔액=1110))
        self.assertTrue(all(p['status'] == '매칭 확인필요' for p in self.plan(data)))

    def test_bank_write_guard(self):
        with self.assertRaises(ValueError):
            sync.update_if_changed(None, {'id': 'b1'}, {'금액': 200}, 'bank', [])

    def test_interrupted_allocation_resumes_saved_partial_budget(self):
        data = confirmed(fixture())
        data['payments'][0]['자동배분계획'] = '[["c1", 50]]'
        data['allocations'] = []
        data['bank'][0]['금액'] = 50
        self.assertEqual(self.plan(data)[0]['allocations'], [('c1', 50)])

    def test_idempotent_patch(self):
        class NoWrites:
            def request(self, *args):
                raise AssertionError('Unnecessary write')
        audit = []
        sync.update_if_changed(NoWrites(), {'id': 'p1', '확인상태': '원장 대조'}, {'확인상태': '원장 대조'}, 'payment', audit)
        self.assertEqual(audit, [])

    def test_one_transfer_allocates_to_two_stores_without_duplicate_receipts(self):
        data = confirmed(fixture())
        data['stores'].append(dict(data['stores'][0], id='s2'))
        data['cycles'].append(dict(data['cycles'][0], id='c2', 매장=['s2'], **{'용역 공급가': 200, '용역 VAT': 20}))
        data['bank'][0].update(매장=['s1', 's2'], 정산회차=['c1', 'c2'], 입금매칭='수동확정', 금액=330)
        data['payments'][0].update(매장=['s1', 's2'], 회차=['c1', 'c2'])
        plan = self.plan(data)
        self.assertEqual(len(plan), 1)
        self.assertEqual(plan[0]['stores'], ['s1', 's2'])
        self.assertEqual(plan[0]['allocations'], [('c1', 110), ('c2', 220)])
        self.assertEqual(sum(a for _, a in plan[0]['allocations']), 330)
        data['bank'][0]['매장'] = ['s1']
        self.assertEqual(self.plan(data)[0]['status'], '매칭 확인필요')

    def test_refunded_unallocated_payment_stays_out_of_work_cycles(self):
        data = fixture()
        data['bank'][0].update(매장=['s1'], 정산회차=[], 입금매칭='수동확정')
        data['bank'].append(dict(data['bank'][0], id='refund', 구분='출금', 거래ID='202609061100|출금|110|890', 잔액=890))
        data['payments'] = [{'id': 'p1', '매장': ['s1'], '회차': [], '원장거래': ['b1'],
                             '환불거래': ['refund'], '확인상태': '원장 대조', '납부구분': '선입금'}]
        data['allocations'] = [{'id': 'a1', '입금': ['p1'], '회차': [], '매장': ['s1'], '배분종류': '선수금'}]
        plan = self.plan(data)[0]
        self.assertTrue(plan['unallocated'])
        self.assertEqual(plan['allocations'], [])
        data['bank'] = data['bank'][:1]
        with self.assertRaises(ValueError):
            self.plan(data)

    def test_refund_reduces_available_funds_for_conflict_check(self):
        data = confirmed(fixture())
        data['bank'].append(dict(data['bank'][0], id='refund', 구분='출금', 금액=10,
                                 거래ID='202609061100|출금|10|990', 잔액=990))
        data['payments'][0]['환불거래'] = ['refund']
        data['bank'].append(dict(data['bank'][0], id='b2', 금액=10, 입금매칭='수동확정',
                                 거래ID='202609061200|입금|10|1000'))
        plans = self.plan(data)
        self.assertTrue(all(p['status'] == '원장 대조' for p in plans))

    def test_verified_cash_waiting_for_cycle_is_not_applied_to_invoice(self):
        data = fixture()
        data['bank'][0].update(매장=['s1'], 정산회차=[], 입금매칭='회차확인')
        data['payments'] = [{'id': 'p1', '매장': ['s1'], '회차': [], '원장거래': ['b1'],
                             '확인상태': '원장 대조', '납부구분': '선입금'}]
        plan = self.plan(data)[0]
        self.assertEqual(plan['status'], '원장 대조')
        self.assertTrue(plan['unallocated'])
        self.assertEqual(plan['allocations'], [])
        data['bank'][0]['상대/적요'] = 'Unverified person'
        self.assertEqual(self.plan(data)[0]['status'], '매칭 확인필요')


if __name__ == '__main__':
    unittest.main()
