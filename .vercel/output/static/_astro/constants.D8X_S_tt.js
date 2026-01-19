import{r as c}from"./index.BfkTPTwy.js";/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),s=(...e)=>e.filter((t,r,o)=>!!t&&t.trim()!==""&&o.indexOf(t)===r).join(" ").trim();/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var u={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=c.forwardRef(({color:e="currentColor",size:t=24,strokeWidth:r=2,absoluteStrokeWidth:o,className:n="",children:i,iconNode:l,...d},p)=>c.createElement("svg",{ref:p,...u,width:t,height:t,stroke:e,strokeWidth:o?Number(r)*24/Number(t):r,className:s("lucide",n),...d},[...l.map(([m,f])=>c.createElement(m,f)),...Array.isArray(i)?i:[i]]));/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const a=(e,t)=>{const r=c.forwardRef(({className:o,...n},i)=>c.createElement(C,{ref:i,iconNode:t,className:s(`lucide-${h(e)}`,o),...n}));return r.displayName=`${e}`,r};/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=a("ChartColumn",[["path",{d:"M3 3v16a2 2 0 0 0 2 2h16",key:"c24i48"}],["path",{d:"M18 17V9",key:"2bz60n"}],["path",{d:"M13 17V5",key:"1frdt8"}],["path",{d:"M8 17v-3",key:"17ska0"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=a("MapPin",[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=a("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]]),E=[{id:"seo",title:"프리미엄 SEO",description:"기술적 정교함과 콘텐츠 권위를 바탕으로 구글 첫 페이지를 선점합니다.",icon:S},{id:"maps",title:"지도 최적화 (Local SEO)",description:"지역 검색 결과에서 귀하의 비즈니스가 가장 먼저 선택되도록 만듭니다.",icon:y},{id:"profile",title:"비즈니스 프로필 관리",description:"구글 비즈니스 프로필을 체계적으로 관리하여 디지털 평판을 높입니다.",icon:k}],v=[{id:"1",client:"어반 에스테틱",metric:"유기적 트래픽",value:"+420%",description:"6개월 만에 시장 리더로 도약한 성공 사례.",colSpan:2},{id:"2",client:"로펌 파트너스",metric:"지도 전화 문의",value:"3.5x",description:"로컬 지배력 강화 전략 실행.",colSpan:1},{id:"3",client:"테크 솔루션",metric:"리드 전환",value:"+180%",description:"구매 의도가 높은 키워드 타겟팅.",colSpan:1}],x=[{month:"1월",traffic:1200},{month:"2월",traffic:1900},{month:"3월",traffic:2400},{month:"4월",traffic:3800},{month:"5월",traffic:5100},{month:"6월",traffic:8500}];export{v as C,E as S,x as a};
