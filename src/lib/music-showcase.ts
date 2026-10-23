import { soundThreadAt } from '../data/sound-thread';

type Player = {
  playVideo(): void;
  pauseVideo(): void;
  destroy(): void;
  getCurrentTime(): number;
};
type PlayerEvent = { target: Player; data: number };
type PlayerOptions = {
  host: string;
  videoId: string;
  playerVars: Record<string, string | number>;
  events: {
    onReady(event: PlayerEvent): void;
    onStateChange(event: PlayerEvent): void;
    onError(event: PlayerEvent): void;
    onAutoplayBlocked(): void;
  };
};
type Youtube = { Player: new (element: HTMLElement, options: PlayerOptions) => Player };
declare global {
  interface Window { YT?: Youtube; onYouTubeIframeAPIReady?: () => void }
}
let youtubePromise: Promise<Youtube> | undefined;
function loadYoutube(): Promise<Youtube> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubePromise) return youtubePromise;
  youtubePromise = new Promise<Youtube>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    const timer = window.setTimeout(() => fail(), 15000);
    const script = document.createElement('script');
    const fail = () => {
      clearTimeout(timer);
      script.remove();
      youtubePromise = undefined;
      reject(new Error('YouTube could not load'));
    };
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      clearTimeout(timer);
      if (window.YT?.Player) resolve(window.YT);
      else fail();
    };
    script.src = 'https://www.youtube.com/iframe_api';
    script.onerror = fail;
    document.head.append(script);
  });
  return youtubePromise;
}

export function initShowcase(root: HTMLElement) {
  const slides = [...root.querySelectorAll<HTMLElement>('[data-slide]')];
  if (!slides.length) return;
  const controls = root.querySelector<HTMLElement>('[data-showcase-controls]')!;
  const detail = root.querySelector<HTMLElement>('[data-showcase-detail]')!;
  const sessions = [...root.querySelectorAll<HTMLButtonElement>('[data-session]')];
  const captions = slides.map((slide) => {
    const caption = slide.querySelector<HTMLElement>('.music-caption')!.cloneNode(true) as HTMLElement;
    caption.querySelector('.music-note')?.remove();
    caption.querySelector('.music-eyebrow')?.remove();
    return caption;
  });
  const feedback = root.querySelector<HTMLElement>('[data-player-feedback]')!;
  const soundStage = root.querySelector<HTMLElement>('[data-sound-stage]')!;
  const wave = root.querySelector<SVGPathElement>('[data-sound-wave]')!;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const positions = new Map<number, number>();
  let selected = 0;
  let player: Player | undefined;
  let playerIndex = -1;
  let generation = 0;
  let state = -1;
  let ended = false;
  let pendingPlay = false;
  let waveFrame = 0;
  let waveTime = 0;
  let playerObserver: IntersectionObserver | undefined;
  let panelRestore: (() => void) | undefined;

  function visible() {
    const box = slides[selected].querySelector('.music-player')!.getBoundingClientRect();
    return !document.hidden && box.bottom > 0 && box.top < innerHeight && box.right > 0 && box.left < innerWidth;
  }
  function drawWave(time: number) {
    if (time - waveTime >= 32) {
      wave.setAttribute('d', 'M40 0' + soundThreadAt(0, 0, 80, 600, time / 260));
      waveTime = time;
    }
    waveFrame = requestAnimationFrame(drawWave);
  }
  function updateWave() {
    cancelAnimationFrame(waveFrame);
    const playing = state === 1 && visible();
    soundStage.classList.toggle('is-playing', playing);
    root.dataset.playback = playing ? 'playing' : 'paused';
    root.querySelector('[data-showcase-state]')!.textContent = playing ? 'NOW PLAYING' : pendingPlay ? 'LOADING SESSION' : state === 0 ? 'SESSION FINISHED' : 'READY TO PLAY';
    if (playing && !reduce.matches) waveFrame = requestAnimationFrame(drawWave);
    else wave.setAttribute('d', 'M40 0' + soundThreadAt(0, 0, 80, 600));
  }
  function remember() {
    if (player && playerIndex >= 0 && !ended) {
      try { positions.set(playerIndex, player.getCurrentTime() || 0); } catch { /* Not ready yet. */ }
    }
  }
  function disposePlayer() {
    generation++;
    remember();
    playerObserver?.disconnect();
    playerObserver = undefined;
    player?.destroy();
    player = undefined;
    panelRestore?.();
    panelRestore = undefined;
    playerIndex = -1;
    ended = false;
    state = -1;
    pendingPlay = false;
    updateWave();
  }
  function pause() {
    pendingPlay = false;
    player?.pauseVideo();
    state = 2;
    if (feedback.textContent === 'Loading performance…') feedback.textContent = '';
    updateWave();
  }
  async function play() {
    if (!visible()) return;
    if (player && playerIndex === selected) {
      player.playVideo();
      return;
    }
    disposePlayer();
    const token = generation;
    const index = selected;
    pendingPlay = true;
    feedback.textContent = 'Loading performance…';
    updateWave();
    const observedPanel = slides[index].querySelector<HTMLElement>('.music-player')!;
    playerObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting && !document.fullscreenElement) pause();
    }, { threshold: 0 });
    playerObserver.observe(observedPanel);
    try {
      const youtube = await loadYoutube();
      if (token !== generation || index !== selected || !pendingPlay) return;
      if (!visible()) { pause(); return; }
      const panel = slides[index].querySelector<HTMLElement>('.music-player')!;
      const button = panel.querySelector<HTMLButtonElement>('[data-youtube-id]')!;
      const preview = [...panel.childNodes];
      const mount = document.createElement('div');
      panel.replaceChildren(mount);
      panelRestore = () => panel.replaceChildren(...preview);
      playerIndex = index;
      const current = () => token === generation && index === selected;
      player = new youtube.Player(mount, {
        host: 'https://www.youtube-nocookie.com',
        videoId: button.dataset.youtubeId!,
        playerVars: { enablejsapi: 1, origin: location.origin, playsinline: 1, start: Math.floor(positions.get(index) ?? 0) },
        events: {
          onReady: ({ target }) => {
            if (!current()) return;
            const frame = panel.querySelector('iframe');
            if (frame) { frame.classList.add('video-frame'); frame.title = button.getAttribute('aria-label') ?? 'Band performance'; }
            feedback.textContent = '';
            if (pendingPlay && visible()) target.playVideo();
          },
          onStateChange: ({ data, target }) => {
            if (!current()) return;
            state = data;
            if (data === 1 && !visible()) { pause(); return; }
            if (data === 1) { ended = false; pendingPlay = false; feedback.textContent = ''; }
            if (data === 0) { ended = true; positions.set(index, 0); pendingPlay = false; }
            // Native play controls are observed, rather than assuming a click meant playback.
            player = target;
            updateWave();
          },
          onAutoplayBlocked: () => {
            if (!current()) return;
            state = 2;
            pendingPlay = false;
            feedback.textContent = 'Press play in the video to continue.';
            updateWave();
          },
          onError: () => {
            if (!current()) return;
            disposePlayer();
            feedback.textContent = 'This performance could not load. Try play again, or watch on YouTube below its title.';
          },
        },
      });
    } catch {
      if (token !== generation) return;
      disposePlayer();
      feedback.textContent = 'YouTube could not load. Try play again, or use the YouTube link below the title.';
    }
  }
  function updateSelection() {
    for (const [index, slide] of slides.entries()) {
      const active = index === selected;
      slide.hidden = !active;
      sessions[index].setAttribute('aria-current', String(active));
      slide.classList.toggle('is-selected', active);
      const button = slide.querySelector<HTMLButtonElement>('[data-youtube-id]');
      if (button) {
        const title = captions[index].querySelector('h3')?.textContent ?? 'performance';
        button.setAttribute('aria-label', `Play ${title}${active ? ', current session' : ''}`);
        button.setAttribute('aria-current', String(active));
      }
    }
    detail.replaceChildren(captions[selected].cloneNode(true));
    root.querySelector('[data-showcase-count]')!.textContent = `${String(selected + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  }
  function select(index: number) {
    index = (index + slides.length) % slides.length;
    if (index === selected) { void play(); return; }
    disposePlayer();
    selected = index;
    feedback.textContent = '';
    updateSelection();
    // Keep keyboard focus on the session picker; changing a session is instant.
    void play();
  }
  root.classList.add('is-enhanced');
  controls.hidden = false;
  root.querySelector<HTMLElement>('[data-showcase-sessions]')!.hidden = false;
  updateSelection();
  updateWave();
  root.querySelector('[data-showcase-prev]')!.addEventListener('click', () => void select(selected - 1));
  root.querySelector('[data-showcase-next]')!.addEventListener('click', () => void select(selected + 1));
  sessions.forEach((button, index) => button.addEventListener('click', () => select(index)));
  root.addEventListener('keydown', (event) => {
    if (!(event.target instanceof Element) || !event.target.closest('[data-showcase-sessions], .showcase-arrows') || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    select(selected + (event.key === 'ArrowRight' ? 1 : -1));
    if (event.target.closest('[data-showcase-sessions]')) sessions[selected].focus();
  });
  root.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest('[data-youtube-id]');
    if (!button) return;
    const index = slides.findIndex((slide) => slide.contains(button));
    if (index >= 0) void select(index);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  reduce.addEventListener('change', updateWave);
}
