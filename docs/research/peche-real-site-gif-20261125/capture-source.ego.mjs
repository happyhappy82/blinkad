// Operate the actual public site and capture at DPR2 (Ego saves these screenshots at CSS 1600x900).
const fs=await import('node:fs/promises');const task=await taskSpace(139);const page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1600,height:900,deviceScaleFactor:2,mobile:false});
await page.goto('https://pecheskin.clinic/ko');
await page.waitForFunction(()=>document.fonts.status==='loaded'&&[...document.images].some(i=>i.complete&&i.naturalWidth>1000));
const target=await page.evaluate(()=>{const a=document.querySelector('a[href="/ko/products"]');return {url:location.href,label:a.textContent,rect:a.getBoundingClientRect().toJSON(),viewport:[innerWidth,innerHeight],devicePixelRatio,scrollWidth:document.documentElement.scrollWidth}});
const root='/tmp/blinkad-insight-higgsfield-plan-20261124/docs/research/peche-real-site-gif-20261125';
await page.screenshot({path:root+'/source-home.png'});
await page.click('loc=href:/ko/products',{label:'Recording the real menu selection'});
await page.waitForFunction(()=>location.pathname==='/ko/products'&&document.body.innerText.includes('주름 보톡스'));
await page.evaluate(()=>window.scrollTo({top:240,behavior:'instant'}));
await page.waitForFunction(()=>scrollY===240);
await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(true)))));
await page.screenshot({path:root+'/source-treatments.png'});
const result=await page.evaluate(()=>({url:location.href,title:document.title,scrollY,scrollWidth:document.documentElement.scrollWidth,treatmentLinks:document.querySelectorAll('main a[href^="/ko/products/"]').length}));
await fs.writeFile(root+'/source.json',JSON.stringify({date_kst:'2026-11-25',clinic:'페슈의원',method:'Actual browser screenshots at DPR2 after real menu navigation; loading removed and final page scrolled 240px in the edit',target,result},null,2)+'\n');console.log({target,result});
