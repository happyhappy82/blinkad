// Capture a timeline composed from two screenshots of the actual site.
const fs=await import('node:fs/promises');
const task=await taskSpace(139);const page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:960,height:540,deviceScaleFactor:1,mobile:false});
await page.goto('http://127.0.0.1:18952/real-clinic/composition.html');
await page.waitForFunction(()=>typeof window.setDemoTime==='function');
await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>i.decode()));});
const output='/tmp/blinkad-peche-real-site-frames-20261125';await fs.mkdir(output,{recursive:true});
for(let i=0;i<80;i++){await page.evaluate(t=>{window.setDemoTime(t);void document.body.offsetHeight},i*50);const dst=`${output}/frame-${String(i).padStart(3,'0')}.png`;if(i>0&&i<9)await fs.copyFile(`${output}/frame-000.png`,dst);else if(i>46)await fs.copyFile(`${output}/frame-046.png`,dst);else await page.screenshot({path:dst});if(i%20===0)console.log({captured:i+1,total:80});}
console.log({captured:80,output,state:await page.evaluate(()=>window.demoState)});
