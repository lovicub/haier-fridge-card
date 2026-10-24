'use strict';
window.blockedTransports = [];
for (const name of ['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'Worker', 'SharedWorker', 'RTCPeerConnection', 'WebTransport']) {
  Object.defineProperty(window, name, {configurable:false, writable:false, value:function () {
    window.blockedTransports.push(name);
    throw new Error('Offline fixture: blocked ' + name);
  }});
}
Object.defineProperty(navigator, 'sendBeacon', {value:() => { window.blockedTransports.push('sendBeacon'); return false; }});
// No HA frontend or external icon font is loaded.
customElements.define('ha-icon', class extends HTMLElement {
  connectedCallback() { this.textContent = '◇'; this.setAttribute('aria-hidden', 'true'); }
});
