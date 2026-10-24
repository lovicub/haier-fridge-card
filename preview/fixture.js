'use strict';
const config = {
  type:'custom:haier-fridge-card', title:'Demo Fridge', model:'DEMO',
  entity_fridge_target:'number.demo_fridge', entity_my_zone_target:'number.demo_zone',
  entity_freezer_target:'number.demo_freezer', entity_humidity:'sensor.demo_humidity',
  entity_door_fridge:'binary_sensor.demo_door'
};
const ids = [config.entity_fridge_target, config.entity_my_zone_target, config.entity_freezer_target, config.entity_humidity, config.entity_door_fridge];
const calls = [], events = [], routes = [];
const card = document.createElement('haier-fridge-card');
function log() { document.querySelector('#log').textContent = JSON.stringify({services:calls,moreInfo:events,history:routes}, null, 2); }
function unsupported(kind, args) { calls.push({kind,args}); log(); return Promise.reject(new Error('Unsupported mock API: ' + kind)); }
function makeHass(scenario='normal') {
  const values = scenario === 'updated' ? ['6','1','-20','60','on'] : ['4','2','-18','45','off'];
  const states = {};
  if (scenario !== 'missing') ids.forEach((id,i) => {
    states[id] = {entity_id:id, state:['unknown','unavailable'].includes(scenario) ? scenario : (i===4 && scenario==='open' ? 'on' : values[i]), attributes:{unit_of_measurement:i<3?'°C':i===3?'%':undefined}, last_updated:new Date().toISOString(),last_changed:new Date().toISOString()};
  });
  return {states, callService:(...args)=>{calls.push({kind:'callService',args});log();return Promise.resolve({});},callWS:(...args)=>unsupported('callWS',args),callApi:(...args)=>unsupported('callApi',args)};
}
card.addEventListener('hass-more-info', e => { events.push(e.detail); log(); });
// Intercept the exact navigation API used by the source: no real HA history route.
history.pushState = (state, unused, url) => { routes.push({state,url}); log(); };
card.setConfig(config);
document.querySelector('#mount').append(card);
function scenario(name) { card.hass = makeHass(name); }
document.querySelectorAll('[data-scenario]').forEach(b=>b.addEventListener('click',()=>scenario(b.dataset.scenario)));
window.fixture = {card,config,ids,calls,events,routes,makeHass,scenario,reset(){calls.length=events.length=routes.length=0;log();}};
scenario('normal'); log();
