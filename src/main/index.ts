import { app, BrowserWindow, session } from 'electron'
import contentSecurityPolicy from '@/dist/csp.txt' // generated during renderer compile

async function main () {
  await app.whenReady()

  session.defaultSession.webRequest.onHeadersReceived((details, apply) => {
    apply(details.url.startsWith('devtools:') ? {} : {
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': contentSecurityPolicy
      }
    })
  })

  const window = new BrowserWindow({
    title: 'Trilogy',
    width: 800,
    height: 600,
    show: false,
    backgroundColor: 'black',
    webPreferences: {
      contextIsolation: true,
      worldSafeExecuteJavaScript: true
    }
  })

  window.once('ready-to-show', () => {
    window.show()
  })
  
  window.loadFile('dist/renderer.html')
}

main()