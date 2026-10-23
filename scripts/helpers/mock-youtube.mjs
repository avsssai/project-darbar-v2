/** Install before navigation so playback checks never depend on YouTube/network. */
export async function mockYoutube(page) {
  await page.route('https://www.youtube-nocookie.com/**', (route) => route.fulfill({ contentType: 'text/html', body: '<button>Mock player controls</button>' }));
  await page.addInitScript(() => {
    window.__youtube = { mode: 'normal', players: [], transitions: [], maxPlaying: 0 };
    window.YT = {
      Player: class {
        constructor(mount, options) {
          this.options = options;
          this.time = Number(options.playerVars.start || 0);
          this.state = -1;
          this.destroyed = false;
          this.frame = document.createElement('iframe');
          this.frame.src = `${options.host}/embed/${options.videoId}`;
          mount.replaceWith(this.frame);
          window.__youtube.players.push(this);
          queueMicrotask(() => options.events.onReady({ target: this }));
        }
        setState(state) {
          if (this.destroyed) return;
          this.state = state;
          window.__youtube.transitions.push({ id: this.options.videoId, state });
          window.__youtube.maxPlaying = Math.max(window.__youtube.maxPlaying, window.__youtube.players.filter((player) => !player.destroyed && player.state === 1).length);
          this.options.events.onStateChange({ target: this, data: state });
        }
        playVideo() {
          if (window.__youtube.mode === 'blocked') { this.options.events.onAutoplayBlocked(); return; }
          if (window.__youtube.mode === 'error') { this.options.events.onError({ target: this, data: 150 }); return; }
          this.setState(1);
        }
        pauseVideo() { this.setState(2); }
        getCurrentTime() { return this.time; }
        destroy() { this.state = -1; this.destroyed = true; this.frame.remove(); }
      },
    };
  });
}
