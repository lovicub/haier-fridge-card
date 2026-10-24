/*
 * Haier Fridge Premium Card v5.0.0
 * Vector edition. Self-contained SVG/CSS; no external assets.
 */
class HaierFridgeCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement('haier-fridge-card-editor');
  }

  static getStubConfig(hass) {
    const ids = Object.keys(hass?.states || {});
    const find = (...parts) =>
      ids.find((id) => parts.every((part) => id.toLowerCase().includes(part)));

    return {
      type: 'custom:haier-fridge-card',
      title: 'Haier Fridge',
      model: 'HDPW5620ANPD',
      entity_fridge_target:
        find('zieltemperatur', 'kuhlschrank') ||
        'number.hdpw5620anpd_zieltemperatur_kuhlschrank',
      entity_my_zone_target:
        find('zieltemperatur', 'my_zone') ||
        'number.hdpw5620anpd_zieltemperatur_my_zone',
      entity_freezer_target:
        find('zieltemperatur', 'gefrierschrank') ||
        'number.hdpw5620anpd_zieltemperatur_gefrierschrank',
      entity_humidity:
        find('luftfeuchtigkeit') ||
        'sensor.hdpw5620anpd_luftfeuchtigkeit',
      entity_door_fridge:
        find('tur_offen', 'kuhlschrank') ||
        'binary_sensor.hdpw5620anpd_tur_offen_kuhlschrank',
      show_history_button: true,
      show_last_updated: true,
      animate: true,
    };
  }

  setConfig(config) {
    if (!config) throw new Error('Brak konfiguracji karty');
    this.config = {
      title: 'Haier Fridge',
      model: 'HDPW5620ANPD',
      show_history_button: true,
      show_last_updated: true,
      animate: true,
      ...config,
    };
    this._rendered = false;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.config) return;
    if (!this._rendered) this.render();
    else this._updateDynamic();
  }

  connectedCallback() {
    this._ensureResizeObserver();
    if (this.config && !this._rendered) this.render();
  }

  disconnectedCallback() {
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
  }

  _ensureResizeObserver() {
    if (this._resizeObserver) return;

    this._resizeObserver = new ResizeObserver((entries) => {
      const width =
        entries?.[0]?.contentRect?.width ||
        this.getBoundingClientRect().width;
      this._applyWidthClasses(width);
    });

    this._resizeObserver.observe(this);
  }

  _applyWidthClasses(width = this.getBoundingClientRect().width) {
    const card = this.querySelector('.hfc-card');
    if (!card || !width) return;
    card.classList.toggle('compact', width < 700);
    card.classList.toggle('tight', width < 520);
    card.classList.toggle('stacked', width < 360);
  }

  getCardSize() {
    return 8;
  }

  _state(entityId) {
    return entityId && this._hass?.states?.[entityId];
  }

  _value(entityId, fallback = '–') {
    const value = this._state(entityId)?.state;
    if (
      value == null ||
      ['unknown', 'unavailable', 'none', ''].includes(
        String(value).toLowerCase(),
      )
    ) {
      return fallback;
    }
    return value;
  }

  _number(entityId, fallback) {
    const value = Number.parseFloat(this._value(entityId, fallback));
    return Number.isFinite(value) ? value : fallback;
  }

  _unit(entityId, fallback = '') {
    return this._state(entityId)?.attributes?.unit_of_measurement || fallback;
  }

  _doorOpen(entityId) {
    return ['on', 'open', 'true', '1', 'offen', 'opened'].includes(
      String(this._value(entityId, 'off')).toLowerCase(),
    );
  }

  _escape(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  _moreInfo(entityId) {
    if (!entityId) return;
    const event = new Event('hass-more-info', {
      bubbles: true,
      composed: true,
    });
    event.detail = { entityId };
    this.dispatchEvent(event);
  }

  _history(entityId) {
    if (!entityId) return;
    history.pushState(
      null,
      '',
      `/history?entity_id=${encodeURIComponent(entityId)}`,
    );
    window.dispatchEvent(new Event('location-changed'));
  }

  _updated(entityId) {
    if (!this.config?.show_last_updated) return '';
    const timestamp = this._state(entityId)?.last_updated;
    if (!timestamp) return 'Keine Daten';

    const minutes = Math.floor(
      Math.max(0, Date.now() - new Date(timestamp).getTime()) / 60000,
    );

    if (minutes < 1) return 'Gerade eben';
    if (minutes === 1) return 'Vor 1 Minute';
    if (minutes < 60) return `Vor ${minutes} Min.`;

    const hours = Math.floor(minutes / 60);
    if (hours === 1) return 'Vor 1 Stunde';
    if (hours < 24) return `Vor ${hours} Std.`;

    return `Vor ${Math.floor(hours / 24)} Tagen`;
  }

  _infoTile(name, value, icon, tone, entityId) {
    return `
      <button class="info-tile ${tone}" data-entity="${this._escape(entityId || '')}">
        <span class="info-icon"><ha-icon icon="${icon}"></ha-icon></span>
        <span class="info-copy">
          <small>${name}</small>
          <b>${value}</b>
        </span>
      </button>
    `;
  }

  render() {
    if (!this.config) return;

    const fridgeEntity =
      this.config.entity_fridge_target || this.config.fridge_entity;
    const myZoneEntity =
      this.config.entity_my_zone_target || this.config.my_zone_entity;
    const freezerEntity =
      this.config.entity_freezer_target || this.config.freezer_entity;
    const humidityEntity =
      this.config.entity_humidity || this.config.humidity_entity;
    const doorEntity =
      this.config.entity_door_fridge || this.config.door_entity;

    this.innerHTML = `
      <ha-card class="hfc-card">
        <style>${this._style()}</style>

        <header class="header">
          <div class="app-icon">
            <ha-icon icon="mdi:snowflake"></ha-icon>
          </div>

          <div class="header-copy">
            <div class="title">${this._escape(this.config.title)}</div>
            <div class="subtitle">
              <i></i>
              <span class="online-text">Online</span>
            </div>
          </div>

          <span class="edition">Haier<span>PREMIUM</span></span>
        </header>

        <section class="hero">
          <div class="visual-wrap">
            <div class="visual-caption">PRECISION COOLING <span>${this._escape(this.config.model)}</span></div>
            ${this._fridgeSVG()}
            <div class="visual-legend"><i></i><span class="visual-status">Kühlstatus</span></div>
          </div>

          <div class="info-column">
            ${this._infoTile('Kühlschrank · Soll', '–', 'mdi:thermometer', 'blue', fridgeEntity)}
            ${this._infoTile('My Zone · Soll', '–', 'mdi:leaf', 'green', myZoneEntity)}
            ${this._infoTile('Gefrierfach · Soll', '–', 'mdi:snowflake', 'purple', freezerEntity)}
            ${this._infoTile('Luftfeuchtigkeit', '–', 'mdi:water-percent', 'cyan', humidityEntity)}
            ${this._infoTile('Tür', '–', 'mdi:door-closed', 'amber', doorEntity)}
          </div>
        </section>

        <footer class="footer">
          <div class="updated-block">
            <ha-icon icon="mdi:clock-outline"></ha-icon>
            <span>
              <small>Letzte Aktualisierung</small>
              <b class="updated-value">Keine Daten</b>
            </span>
          </div>

          ${
            this.config.show_history_button
              ? `
                <button class="history-button" data-history="${this._escape(fridgeEntity || '')}">
                  <ha-icon icon="mdi:chart-bar"></ha-icon>
                  <span>Verlauf anzeigen</span>
                  <ha-icon class="history-arrow" icon="mdi:chevron-right"></ha-icon>
                </button>
              `
              : ''
          }
        </footer>
      </ha-card>
    `;

    this.querySelectorAll('[data-entity]').forEach((element) => {
      element.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this._moreInfo(element.dataset.entity);
      });
    });

    this.querySelector('[data-history]')?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this._history(event.currentTarget.dataset.history);
    });

    this._rendered = true;
    this._ensureResizeObserver();
    this._applyWidthClasses();
    this._updateDynamic();
  }

  _updateDynamic() {
    const fridgeEntity =
      this.config.entity_fridge_target || this.config.fridge_entity;
    const myZoneEntity =
      this.config.entity_my_zone_target || this.config.my_zone_entity;
    const freezerEntity =
      this.config.entity_freezer_target || this.config.freezer_entity;
    const humidityEntity =
      this.config.entity_humidity || this.config.humidity_entity;
    const doorEntity =
      this.config.entity_door_fridge || this.config.door_entity;

    const fridge = this._number(fridgeEntity, NaN);
    const myZone = this._number(myZoneEntity, NaN);
    const freezer = this._number(freezerEntity, NaN);
    const humidity = this._value(humidityEntity, '–');
    const humidityUnit = this._unit(humidityEntity, '%') || '%';
    const doorOpen = this._doorOpen(doorEntity);
    const updated = this._updated(fridgeEntity || doorEntity);

    const card = this.querySelector('.hfc-card');
    if (!card) return;

    const doorKnown = this._value(doorEntity, null) !== null;
    const available = [fridgeEntity, myZoneEntity, freezerEntity, humidityEntity, doorEntity]
      .filter(Boolean).some(id => this._value(id, null) !== null);
    card.classList.toggle('is-open', doorKnown && doorOpen);
    card.classList.toggle('is-closed', doorKnown && !doorOpen);
    card.classList.toggle('door-unknown', !doorKnown);
    card.classList.toggle('is-offline', !available);
    card.classList.toggle('no-animation', this.config.animate === false);
    this.querySelector('.online-text').textContent = !available ? 'Keine Daten' : doorKnown && doorOpen ? 'Tür offen' : 'Verbunden';
    this.querySelector('.visual-status').textContent = !doorKnown ? 'Türstatus unbekannt' : doorOpen ? 'Tür geöffnet' : 'Tür geschlossen';
    this.querySelector('.updated-block').hidden = this.config.show_last_updated === false;
    this.querySelector('.fridge-svg').setAttribute('aria-label', !doorKnown ? 'Kühlschrank, Türstatus unbekannt' : doorOpen ? 'Kühlschrank mit offener Tür' : 'Kühlschrank mit geschlossener Tür');
    const temp = (value, entity) => Number.isFinite(value) ? `${value.toFixed(1)} ${this._unit(entity, '°C')}` : '–';

    const tiles = this.querySelectorAll('.info-tile');
    if (tiles.length >= 5) {
      tiles[0].querySelector('b').textContent = temp(fridge, fridgeEntity);
      tiles[1].querySelector('b').textContent = temp(myZone, myZoneEntity);
      tiles[2].querySelector('b').textContent = temp(freezer, freezerEntity);
      tiles[3].querySelector('b').textContent = humidity === '–' ? '–' : `${humidity} ${humidityUnit}`;
      tiles[4].querySelector('b').textContent = !doorKnown ? 'Unbekannt' : doorOpen
        ? 'Geöffnet'
        : 'Geschlossen';
      tiles[4]
        .querySelector('ha-icon')
        .setAttribute(
          'icon',
          doorOpen ? 'mdi:door-open' : 'mdi:door-closed',
        );
    }

    this.querySelector('.updated-value').textContent = updated;
  }

  _fridgeSVG() {
    // Unique paint-server IDs keep multiple cards independent in the same dashboard.
    this._svgId ||= 'hfc-' + Math.random().toString(36).slice(2, 11);
    const id = this._svgId;
    const shelves = [230, 330, 430].map(y => `<path d="M158 ${y} L305 ${y+10} L324 ${y-3} L178 ${y-12} Z" fill="url(#${id}-glass)" stroke="#8bdaff" stroke-opacity=".65"/><path d="M158 ${y+2} L305 ${y+12}" stroke="#79cfff" stroke-width="2"/>`).join('');
    const bottle = (x,y,c,h=75) => `<g transform="translate(${x} ${y})"><path d="M8 0h10v18q0 6 7 16v${h-34}q0 5-5 5H6q-5 0-5-5V34q7-10 7-16Z" fill="${c}" fill-opacity=".7" stroke="#addef9" stroke-opacity=".55"/><path d="M6 39v${h-45}M11 9v15" stroke="#d7f4ff" opacity=".65"/><rect x="7" y="-3" width="12" height="6" rx="2" fill="#8bacc6"/><path d="M2 47h22v20H2Z" fill="#081d36" opacity=".5"/></g>`;
    const grapes = Array.from({length:15},(_,i)=>`<circle cx="${180+(i%5)*8}" cy="${211-Math.floor(i/5)*8}" r="6.5" fill="${['#605790','#494578','#7970a3'][i%3]}" stroke="#bbaaf5" stroke-opacity=".2"/>`).join('');
    const greens = Array.from({length:9},(_,i)=>`<ellipse cx="${181+(i%5)*23}" cy="${466+Math.floor(i/5)*19}" rx="17" ry="14" fill="${['#376b58','#518568','#294e51'][i%3]}" stroke="#89ba8a" stroke-opacity=".3"/>`).join('');
    return `<svg class="fridge-svg" viewBox="0 0 480 780" role="img" aria-label="Kühlschrank" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${id}-side" x1="0" x2="1"><stop stop-color="#101725"/><stop offset=".5" stop-color="#383e51"/><stop offset="1" stop-color="#161e30"/></linearGradient>
        <linearGradient id="${id}-metal" x1="0" y1="0" x2="1" y2=".25"><stop stop-color="#7b8293"/><stop offset=".13" stop-color="#3f485c"/><stop offset=".42" stop-color="#8a91a0"/><stop offset=".64" stop-color="#535b6c"/><stop offset="1" stop-color="#242d41"/></linearGradient>
        <linearGradient id="${id}-edge"><stop stop-color="#c8d0de"/><stop offset=".25" stop-color="#424a5b"/><stop offset="1" stop-color="#a0a7b7"/></linearGradient>
        <linearGradient id="${id}-inside" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#123c67"/><stop offset=".5" stop-color="#082443"/><stop offset="1" stop-color="#22689b"/></linearGradient>
        <linearGradient id="${id}-glass" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#66ccff" stop-opacity=".4"/><stop offset="1" stop-color="#2a6caa" stop-opacity=".08"/></linearGradient>
        <radialGradient id="${id}-halo"><stop stop-color="#398aff" stop-opacity=".6"/><stop offset="1" stop-color="#1766ff" stop-opacity="0"/></radialGradient>
        <pattern id="${id}-brush" width="5" height="4" patternUnits="userSpaceOnUse"><path d="M0 .5h5M2 2.5h3" stroke="#fff" stroke-opacity=".055" stroke-width=".5"/></pattern>
        <filter id="${id}-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="5"/></filter>
      </defs>
      <ellipse cx="238" cy="721" rx="174" ry="40" fill="url(#${id}-halo)"/>
      <path d="M96 691L164 725 347 700" fill="none" stroke="#267cff" stroke-width="10" filter="url(#${id}-glow)"/>
      <g class="door-trails" fill="none" stroke="#6071e8" stroke-opacity=".24"><path d="M330 115l75 25v399l-75 12Z"/><path d="M357 121l76 28v390l-76 13Z"/></g>
      <path d="M88 153L150 103 335 119 351 688 150 722 88 689Z" fill="url(#${id}-side)" stroke="#656e85" stroke-width="1"/>
      <path d="M88 153L150 103V722L88 689Z" fill="url(#${id}-brush)"/>
      <path d="M150 103L335 119V542L150 551Z" fill="#080f1d" stroke="#8790a1"/>
      <path d="M159 126L321 139V518L159 528Z" fill="url(#${id}-inside)" stroke="#8599b6" stroke-width="5"/>
      <g class="interior-light">
        <path d="M164 146V509L315 502V150" fill="none" stroke="#289dff" stroke-width="9" filter="url(#${id}-glow)"/>
        <path d="M164 146V509L315 502" fill="none" stroke="#82d8ff" stroke-width="1.7"/>
        <path d="M178 150L287 158 302 150 195 142Z" fill="#c9f8ff"/>
        <path d="M178 154L289 160" stroke="#49b7ff" stroke-width="12" filter="url(#${id}-glow)"/>
        ${grapes}
        <path d="M242 189h50l-4 35h-43Z" fill="url(#${id}-glass)" stroke="#89c6dc" stroke-opacity=".6"/>
        <g fill="#548b6f"><ellipse cx="260" cy="202" rx="12" ry="9"/><ellipse cx="277" cy="205" rx="12" ry="10"/><ellipse cx="268" cy="194" rx="12" ry="8"/></g>
        ${bottle(174,251,'#544481',70)}${bottle(218,248,'#24719b',78)}${bottle(265,257,'#569f91',70)}
        <g fill="#c49956" stroke="#efc986" stroke-opacity=".3"><circle cx="193" cy="411" r="14"/><circle cx="216" cy="413" r="15"/><circle cx="205" cy="396" r="13"/></g>
        ${bottle(258,350,'#3c779b',74)}
        ${shelves}
        ${greens}
        <path d="M166 448L304 454V501L166 510Z" fill="url(#${id}-glass)" stroke="#92ccea" stroke-opacity=".65"/>
        <path d="M177 459L292 463" stroke="#9bdcff" stroke-opacity=".7"/>
      </g>
      <path d="M151 550L337 542V564L151 574Z" fill="#080d17" stroke="#5b6479"/>
      <path d="M156 574L335 563V689L156 717Z" fill="url(#${id}-metal)" stroke="#9199aa"/>
      <path d="M156 574L335 563V689L156 717Z" fill="url(#${id}-brush)"/>
      <path d="M169 576L324 567" stroke="#cad3e1" stroke-opacity=".7"/>
      <path d="M158 718v8h15v-6M318 697v8h15v-11" stroke="#090f19" stroke-width="7"/>
      <g class="fridge-door" style="transform-origin:330px 0px">
        <path d="M151 105L330 119V541L151 550Z" fill="url(#${id}-metal)" stroke="#c0c7d5" stroke-width="1.3"/>
        <path d="M151 105L330 119V541L151 550Z" fill="url(#${id}-brush)"/>
        <path d="M151 105L159 106V549L151 550Z" fill="url(#${id}-edge)"/>
        <path d="M163 111L327 124" stroke="#d8dfea" stroke-opacity=".5"/>
        <text x="296" y="158" fill="#e0e4ed" font-family="Arial,sans-serif" font-size="12" text-anchor="middle">Haier</text>
        <rect x="238" y="241" width="34" height="90" rx="7" fill="#182333" stroke="#8e9cac" stroke-opacity=".5"/>
        <text x="255" y="266" text-anchor="middle" fill="#b8ddff" font-family="Arial,sans-serif" font-size="13">°C</text>
        <path d="M247 280h16M247 288h16M251 311h8" stroke="#7baacf" stroke-width="2"/>
        <path d="M168 316v104" stroke="#1a2333" stroke-width="5" stroke-linecap="round"/>
        <path d="M170 316v104" stroke="#b8c3d3" stroke-opacity=".4" stroke-linecap="round"/>
      </g>
      <path class="opening-arc" d="M239 83Q337 29 398 105m-18-6 18 6-6-18" fill="none" stroke="#62cbff" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`;
  }

  _style() {
    return `
      haier-fridge-card{display:block;min-width:0}
      .hfc-card,.hfc-card *{box-sizing:border-box}
      .hfc-card{--blue:#92caff;--green:#9bd7ba;--purple:#beb0f4;--cyan:#87d9e7;--amber:#e8bd7d;display:block;position:relative;overflow:hidden;padding:24px;border-radius:28px;color:#edf2fc;background:radial-gradient(ellipse at 15% 42%,#15233c66,transparent 58%),linear-gradient(135deg,#111725,#090e18);border:1px solid #ffffff16;box-shadow:0 22px 60px #0004,inset 0 1px #ffffff06;font-family:var(--paper-font-body1_-_font-family,Inter,system-ui,sans-serif)}
      .hfc-card button{font:inherit;cursor:pointer}.hfc-card button:focus-visible{outline:2px solid #91d9ff;outline-offset:4px}
      .hfc-card .header{display:flex;align-items:center;gap:13px}.hfc-card .app-icon{display:grid;place-items:center;width:46px;height:46px;border-radius:15px;background:linear-gradient(145deg,#284568,#15263e);border:1px solid #8cc6ff24;color:#a9d8ff}
      .hfc-card ha-icon{--mdc-icon-size:23px}.hfc-card .header-copy{flex:1;min-width:0}.hfc-card .title{font-size:23px;font-weight:600;letter-spacing:-.7px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .hfc-card .subtitle{display:flex;gap:7px;align-items:center;font-size:11px;color:#97a9c1;margin-top:5px}.hfc-card .subtitle i,.hfc-card .visual-legend i{height:5px;width:5px;border-radius:50%;background:#8bd7ba;box-shadow:0 0 9px #8bd7ba55}.hfc-card.is-open .subtitle i{background:#e8bd7d}.hfc-card.is-offline .subtitle i{background:#8390a1;box-shadow:none}
      .hfc-card .edition{font-size:21px;letter-spacing:-1px;color:#c9d4e8;text-align:right}.hfc-card .edition span{display:block;font-size:7px;letter-spacing:2px;margin-top:4px;color:#78899e}
      .hfc-card .hero{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:22px;margin-top:25px;align-items:stretch}
      .hfc-card .visual-wrap{position:relative;min-height:435px;overflow:hidden;border-radius:20px;background:radial-gradient(ellipse at 48% 62%,#14315c55,transparent 65%),linear-gradient(155deg,#080e1966,#060b1488);border:1px solid #91adcf0d;display:flex;align-items:center;justify-content:center}
      .hfc-card .visual-caption{position:absolute;z-index:1;left:18px;top:17px;font-size:8px;letter-spacing:2px;color:#8297b3}.hfc-card .visual-caption span{display:block;margin-top:6px;letter-spacing:1px;font-size:8px;color:#52677f}
      .hfc-card .fridge-svg{width:100%;height:435px;display:block;overflow:visible}
      .hfc-card .fridge-door{transform:matrix(1,0,0,1,0,0);transition:transform 1.3s cubic-bezier(.22,.8,.2,1)}
      .hfc-card.is-open .fridge-door{transform:matrix(-.60,-.27,0,1,0,0)}
      .hfc-card .door-trails,.hfc-card .opening-arc{opacity:0;transition:opacity 1s}.hfc-card.is-open .door-trails{opacity:.65}.hfc-card.is-open .opening-arc{opacity:.9;filter:drop-shadow(0 0 5px #287aff)}
      .hfc-card.door-unknown .fridge-svg{opacity:.55}.hfc-card .visual-legend{position:absolute;bottom:16px;display:flex;align-items:center;gap:7px;font-size:9px;letter-spacing:.4px;color:#8098b6}.hfc-card .visual-legend i{background:#78b7ff}
      .hfc-card .info-column{display:grid;gap:9px;align-content:center;min-width:0}.hfc-card .info-tile{display:grid;grid-template-columns:37px minmax(0,1fr);gap:11px;align-items:center;min-height:73px;padding:12px;border:1px solid #aecbf014;border-radius:16px;background:linear-gradient(115deg,#a6c8ff08,#9db8ff02);text-align:left;color:var(--tone);transition:background .2s,border-color .2s,transform .2s}
      .hfc-card .info-tile:hover{background:#adcfff0d;border-color:#adcfff40;transform:translateY(-1px)}.hfc-card .info-icon{width:36px;height:39px;display:grid;place-items:center;border-radius:12px;background:color-mix(in srgb,var(--tone) 8%,transparent)}
      .hfc-card .info-copy{display:flex;flex-direction:column;min-width:0}.hfc-card .info-copy small{font-size:10px;color:#95a4ba;line-height:1.4}.hfc-card .info-copy b{font-size:24px;font-weight:500;letter-spacing:-.7px;line-height:1.2;margin-top:4px;font-variant-numeric:tabular-nums;white-space:nowrap}
      .hfc-card .blue{--tone:var(--blue)}.hfc-card .green{--tone:var(--green)}.hfc-card .purple{--tone:var(--purple)}.hfc-card .cyan{--tone:var(--cyan)}.hfc-card .amber{--tone:var(--amber)}.hfc-card .amber .info-copy b{font-size:17px;letter-spacing:-.3px}
      .hfc-card .footer{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:20px;padding-top:18px;border-top:1px solid #aac6f012;flex-wrap:wrap}.hfc-card .updated-block{display:flex;align-items:center;gap:9px;color:#627792}.hfc-card .updated-block[hidden]{display:none}.hfc-card .updated-block ha-icon{--mdc-icon-size:17px}.hfc-card .updated-block span{display:flex;flex-direction:column;gap:4px}.hfc-card .updated-block small{font-size:9px;color:#71839c}.hfc-card .updated-block b{font-size:11px;font-weight:400;color:#acbbcf}
      .hfc-card .history-button{display:flex;gap:7px;align-items:center;color:#a0c8f2;border:1px solid #94bcea23;background:#90bdff08;border-radius:11px;padding:11px 12px;font-size:10px}.hfc-card .history-button ha-icon{--mdc-icon-size:16px}.hfc-card .history-button:hover{background:#90bdff18}
      .hfc-card.compact{padding:20px}.hfc-card.compact .hero{gap:12px}.hfc-card.tight{padding:17px;border-radius:23px}.hfc-card.tight .hero{grid-template-columns:minmax(0,1fr) minmax(0,.93fr);gap:9px;margin-top:20px}.hfc-card.tight .visual-wrap{min-height:366px}.hfc-card.tight .fridge-svg{height:366px;width:118%;max-width:none;flex-shrink:0}.hfc-card.tight .visual-caption{font-size:6px;letter-spacing:1px;left:11px}.hfc-card.tight .visual-caption span{font-size:6px}.hfc-card.tight .info-tile{grid-template-columns:26px minmax(0,1fr);gap:7px;padding:9px 7px;min-height:65px;border-radius:13px}.hfc-card.tight .info-icon{width:26px;height:31px;border-radius:9px}.hfc-card.tight .info-icon ha-icon{--mdc-icon-size:18px}.hfc-card.tight .info-copy b{font-size:20px}.hfc-card.tight .info-copy small{font-size:9px}.hfc-card.tight .amber .info-copy b{font-size:14px}.hfc-card.tight .title{font-size:20px}.hfc-card.tight .edition{font-size:18px}.hfc-card.tight .visual-legend{font-size:8px}
      .hfc-card.stacked .hero{grid-template-columns:1fr}.hfc-card.stacked .visual-wrap{min-height:320px}.hfc-card.stacked .fridge-svg{width:100%;height:320px}.hfc-card.stacked .info-column{grid-template-columns:repeat(2,minmax(0,1fr))}.hfc-card.stacked .info-tile:last-child{grid-column:1/-1}.hfc-card.stacked .edition{display:none}
      .hfc-card.no-animation *{animation:none!important;transition:none!important}
      @media(prefers-reduced-motion:reduce){.hfc-card *{animation:none!important;transition:none!important}}
`;
  }
}

class HaierFridgeCardEditor extends HTMLElement {
  setConfig(config) {
    this.config = config || {};
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  _change(key, value) {
    this.config = { ...this.config, [key]: value };
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: this.config },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _escape(value) { return HaierFridgeCard.prototype._escape.call(this, value); }

  _picker(key, label, domain) {
    return `
      <ha-entity-picker
        data-key="${key}"
        label="${label}"
        value="${this._escape(this.config?.[key] || '')}"
        include-domains='["${domain}"]'
      ></ha-entity-picker>
    `;
  }

  render() {
    if (!this._hass) return;
    const config = this.config || {};

    this.innerHTML = `
      <div class="editor">
        <style>
          .editor{display:grid;gap:14px;padding:12px}
          ha-entity-picker,ha-textfield{display:block}
          .row{display:flex;align-items:center;justify-content:space-between}
        </style>

        <ha-textfield data-key="title" label="Titel" value="${this._escape(config.title || 'Haier Fridge')}"></ha-textfield>
        <ha-textfield data-key="model" label="Modell" value="${this._escape(config.model || 'HDPW5620ANPD')}"></ha-textfield>

        ${this._picker('entity_fridge_target', 'Zieltemperatur Kühlschrank', 'number')}
        ${this._picker('entity_my_zone_target', 'Zieltemperatur My Zone', 'number')}
        ${this._picker('entity_freezer_target', 'Zieltemperatur Gefrierschrank', 'number')}
        ${this._picker('entity_humidity', 'Luftfeuchtigkeit', 'sensor')}
        ${this._picker('entity_door_fridge', 'Tür Kühlschrank', 'binary_sensor')}

        <div class="row">
          <span>Animationen</span>
          <ha-switch data-key="animate" ${config.animate !== false ? 'checked' : ''}></ha-switch>
        </div>

        <div class="row">
          <span>Verlauf anzeigen</span>
          <ha-switch data-key="show_history_button" ${config.show_history_button !== false ? 'checked' : ''}></ha-switch>
        </div>

        <div class="row">
          <span>Letzte Aktualisierung</span>
          <ha-switch data-key="show_last_updated" ${config.show_last_updated !== false ? 'checked' : ''}></ha-switch>
        </div>
      </div>
    `;

    this.querySelectorAll('ha-textfield').forEach((element) => {
      element.addEventListener('change', (event) => {
        this._change(element.dataset.key, event.target.value);
      });
    });

    this.querySelectorAll('ha-entity-picker').forEach((element) => {
      element.hass = this._hass;
      element.includeDomains = JSON.parse(element.getAttribute('include-domains'));
      element.value = this.config[element.dataset.key] || '';
      element.addEventListener('value-changed', (event) => {
        this._change(element.dataset.key, event.detail.value);
      });
    });

    this.querySelectorAll('ha-switch').forEach((element) => {
      element.addEventListener('change', (event) => {
        this._change(element.dataset.key, event.target.checked);
      });
    });
  }
}

if (!customElements.get('haier-fridge-card')) {
  customElements.define('haier-fridge-card', HaierFridgeCard);
}
if (!customElements.get('haier-fridge-card-editor')) {
  customElements.define('haier-fridge-card-editor', HaierFridgeCardEditor);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'haier-fridge-card',
  name: 'Haier Fridge Premium Card',
  preview: true,
  description: 'Premium SVG Haier fridge card',
});

console.info(
  '%c HAIER FRIDGE PREMIUM %c v5.0.0 ',
  'color:#8b6cff;font-weight:700',
  'color:#fff;background:#111629;padding:2px 7px;border-radius:4px',
);
