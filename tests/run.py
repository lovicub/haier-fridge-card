"""Small offline characterization suite for the original card."""
import argparse, hashlib, importlib.util, json, os
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('preview_server',ROOT/'preview/serve.py')
server=importlib.util.module_from_spec(spec);spec.loader.exec_module(server)
OUT=ROOT/'test-results';OUT.mkdir(exist_ok=True)
records=[]
def main():
    parser=argparse.ArgumentParser();parser.add_argument('--executable',default=os.environ.get('CHROMIUM_EXECUTABLE'));args=parser.parse_args()
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,**({'executable_path':args.executable} if args.executable else {}))
        for profile,width,height in [('desktop',1440,1000),('mobile',390,844)]:
            context=browser.new_context(viewport={'width':width,'height':height},service_workers='block')
            blocked=[];errors=[]
            def route(r):
                from urllib.parse import urlsplit
                u=urlsplit(r.request.url);entry=server.FILES.get(u.path)
                if u.scheme=='http' and u.netloc=='fixture.invalid' and entry and r.request.method=='GET' and not u.query:
                    r.fulfill(body=(ROOT/entry[0]).read_bytes(),headers={'Content-Type':entry[1],'Content-Security-Policy':server.CSP})
                else:
                    blocked.append({'url':r.request.url,'method':r.request.method});r.abort()
            context.route('**/*',route)
            probe=context.new_page()
            try:probe.goto('https://blocked.invalid/deny-probe',timeout=3000)
            except Exception:pass
            assert blocked==[{'url':'https://blocked.invalid/deny-probe','method':'GET'}],blocked
            probe.close();blocked.clear()
            page=context.new_page();page.set_default_timeout(5000);page.on('pageerror',lambda e:errors.append(str(e)))
            page.goto('http://fixture.invalid/');page.wait_for_selector('.info-tile')
            def check(case,fn):
                try:fn();record={'profile':profile,'case':case,'status':'passed'}
                except Exception as e:
                    record={'profile':profile,'case':case,'status':'failed','error':str(e)}
                    page.screenshot(path=str(OUT/f'{profile}-{case}.png'),full_page=True)
                records.append(record);print(json.dumps(record,ensure_ascii=False),flush=True)
            def eq(actual,expected):assert actual==expected,f'{actual!r} != {expected!r}'
            def setup(name='normal'):
                page.evaluate('(name)=>{fixture.card.setConfig(fixture.config);fixture.scenario(name);fixture.reset();}',name)
            def values():return page.locator('.info-tile b').all_text_contents()
            def safe():
                eq(page.evaluate('blockedTransports.length'),0)
                page.evaluate('''() => {for(const n of ['fetch','XMLHttpRequest','WebSocket','EventSource','Worker','SharedWorker','RTCPeerConnection','WebTransport'])try{new window[n]('https://blocked.invalid/probe')}catch{};navigator.sendBeacon('https://blocked.invalid/probe','x')}''')
                eq(page.evaluate('blockedTransports.length'),9);eq(blocked,[])
            check('SAFE',safe)
            def normal():
                setup();eq(values(),['4.0 °C','2.0 °C','-18.0 °C','45 %','Geschlossen'])
                eq(page.locator('.online-text').inner_text(),'Verbunden');assert 'is-closed' in page.locator('.hfc-card').get_attribute('class')
            check('NORMAL',normal)
            def opened():
                page.locator('[data-scenario=open]').click();eq(values()[-1],'Geöffnet')
                assert 'is-open' in page.locator('.hfc-card').get_attribute('class')
            check('OPEN',opened)
            def missing():
                setup('missing');eq(values(),['–','–','–','–','Unbekannt'])
                eq(page.locator('.online-text').inner_text(),'Keine Daten')
            check('MISSING',missing)
            def updates():
                setup();page.evaluate('window.savedTile=fixture.card.querySelector(".info-tile")')
                page.locator('[data-scenario=updated]').click();eq(values(),['6.0 °C','1.0 °C','-20.0 °C','60 %','Geöffnet'])
                eq(page.evaluate('savedTile===fixture.card.querySelector(".info-tile")'),True)
            check('UPDATE',updates)
            def controls():
                setup()
                for i in range(5):
                    page.locator('.info-tile').nth(i).click()
                    eq(page.evaluate('fixture.events'),[{'entityId':entity} for entity in page.evaluate('fixture.ids')[:i+1]])
                    eq(page.evaluate('fixture.calls'),[])
                page.locator('.history-button').click()
                eq(page.evaluate('fixture.routes'),[{'state':None,'url':'/history?entity_id=number.demo_fridge'}])
                eq(page.evaluate('fixture.calls'),[])
            check('CONTROLS',controls)
            def runtime():eq(errors,[]);eq(blocked,[])
            check('RUNTIME',runtime)
            for result in records:
                if result['profile']==profile:result['viewport']=f'{width}x{height}'
            context.close()
        browser_version=browser.version;browser.close()
    summary={s:sum(r['status']==s for r in records) for s in ['passed','failed']}
    result={'source_sha256':hashlib.sha256((ROOT/'haier-fridge-card.js').read_bytes()).hexdigest(),'suite_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'browser':browser_version,'profiles':['1440x1000','390x844'],'summary':summary,'records':records}
    (OUT/'results.json').write_text(json.dumps(result,indent=2,ensure_ascii=False))
    raise SystemExit(bool(summary['failed']))
if __name__=='__main__':main()
