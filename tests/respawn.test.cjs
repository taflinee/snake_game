const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function game(){
  const elements={};
  const element=()=>({value:'Lily',style:{},append(){},replaceChildren(){},focus(){},clientWidth:750,clientHeight:450,offsetWidth:200,offsetHeight:40,classList:{add(){},remove(){}},addEventListener(){},setAttribute(){},getContext:()=>({})});
  const sandbox={document:{getElementById:id=>elements[id]||(elements[id]=element()),createElement:element,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},performance:{now:()=>0},requestAnimationFrame(){},setTimeout(){},clearTimeout(){},HTMLInputElement:class{},HTMLButtonElement:class{}};
  vm.createContext(sandbox);
  const source=fs.readFileSync(require('node:path').join(__dirname,'../game.js'),'utf8');
  vm.runInContext(source.replace('reset();requestAnimationFrame(frame);',`reset();globalThis.api={tick,protectionOpacity,bodiesOverlap,setup:(protection,npcProtection,body)=>{
    state='playing';username='Lily';score=100;caught=2;snake=startingBody();spawnProtection=protection;berries=[];
    rivals=[{body,protection:npcProtection,angle:0,target:0,wander:100,dir:{x:1,y:0},color:'#aaa'}];
  },clear:()=>{rivals=[];},get:()=>({score,caught,spawnProtection,snake,rivals})};`),sandbox);
  return sandbox.api;
}
const crossingPlayerHead=()=>[{x:14.5,y:8.8},{x:14.5,y:9.5}];
const crossingPlayerBody=()=>[{x:12.9,y:9.5},{x:12.2,y:9.5}];
test('solid player colliding with a solid body respawns and resets score',()=>{const g=game();g.setup(0,0,crossingPlayerHead());g.tick();assert.equal(g.get().score,0);assert.equal(g.get().spawnProtection,3);assert.equal(g.get().snake.length,5);});
test('protected player cannot be killed by NPC body',()=>{const g=game();g.setup(1,0,crossingPlayerHead());g.tick();assert.equal(g.get().score,100);});
test('NPC head survives touching protected player body without awarding points',()=>{const g=game();g.setup(1,0,crossingPlayerBody());const npc=g.get().rivals[0];g.tick();assert(g.get().rivals.includes(npc));assert.equal(g.get().score,100);});
test('protected NPC body cannot kill player',()=>{const g=game();g.setup(0,1,crossingPlayerHead());g.tick();assert.equal(g.get().score,100);});
test('protected NPC head survives touching solid player body',()=>{const g=game();g.setup(0,1,crossingPlayerBody());const npc=g.get().rivals[0];g.tick();assert(g.get().rivals.includes(npc));assert.equal(g.get().score,100);});
test('protection expiry while overlapping does not cause death',()=>{const g=game();g.setup(.001,0,crossingPlayerHead());g.tick();assert.equal(g.get().score,100);assert(g.get().spawnProtection>0);g.clear();for(let i=0;i<10;i++)g.tick();assert.equal(g.get().spawnProtection,0);});
test('passing through empty center does not kill the player',()=>{const g=game();g.setup(0,0,crossingPlayerHead());g.clear();for(let i=0;i<120;i++)g.tick();assert.equal(g.get().score,100);});
test('self-overlapping player never dies',()=>{const g=game();g.setup(0,0,[{x:14.5,y:9.5},{x:14.5,y:9.5},{x:14.5,y:9.5},{x:14.5,y:9.5},{x:14.5,y:9.5}]);g.clear();g.tick();assert.equal(g.get().score,100);});
test('fade increases smoothly from translucent to fully opaque',()=>{const g=game();assert(Math.abs(g.protectionOpacity(3)-.3)<1e-9);assert(Math.abs(g.protectionOpacity(1.5)-.65)<1e-9);assert.equal(g.protectionOpacity(0),1);});

test('protection remains active for overlapping tails even when both heads are clear',()=>{
  const g=game();
  g.setup(.001,0,[{x:11.38,y:7.9},{x:11.38,y:8.7},{x:11.38,y:9.5}]);
  g.tick();
  assert(g.get().spawnProtection>0);
  assert.equal(g.get().score,100);
});
test('waiting for separation stays visibly translucent without opacity pulsing',()=>{
  const g=game();
  assert.equal(g.protectionOpacity(.001),.9);
  assert.equal(g.protectionOpacity(1/120),.9);
  assert.equal(g.protectionOpacity(0),1);
});
test('body overlap respects wrapping at the garden edges',()=>{
  const g=game();
  assert(g.bodiesOverlap([{x:29.8,y:10}],[{x:.1,y:10}]));
  assert(!g.bodiesOverlap([{x:15,y:10}],[{x:1,y:10}]));
});
