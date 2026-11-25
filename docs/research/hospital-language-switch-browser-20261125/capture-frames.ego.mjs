// Run through ego-browser nodejs, not a standalone browser or Playwright.
const fs = await import('node:fs/promises');
const task = await taskSpace(139);
const page = task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride', {width:960,height:540,deviceScaleFactor:1,mobile:false});
await page.goto('http://127.0.0.1:18952/language-switch-browser/sample.html?capture=1');
await page.waitForFunction(() => typeof window.setDemoTime === 'function' && document.fonts.status === 'loaded');
const output = '/tmp/blinkad-language-switch-browser-frames-20261125';
await fs.mkdir(output, {recursive:true});
for (let index=0; index<80; index++) {
  await page.evaluate(ms => { window.setDemoTime(ms); void document.body.offsetHeight; }, index*50);
  const destination = `${output}/frame-${String(index).padStart(3,'0')}.png`;
  if(index>0 && index<10) await fs.copyFile(`${output}/frame-000.png`, destination);
  else if(index>50) await fs.copyFile(`${output}/frame-050.png`, destination);
  else await page.screenshot({path:destination});
  if(index%20===0) console.log({captured:index+1,total:80});
}
console.log({captured:80,fps:20,duration:4,output,state:await page.evaluate(()=>window.demoState)});
