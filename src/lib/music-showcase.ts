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
  const board = root.querySelector<HTMLElement>('[data-showcase-board]')!;
  const slides = [...root.querySelectorAll<HTMLElement>('[data-slide]')];
  if (!slides.length) return;
  const controls = root.querySelector<HTMLElement>('[data-showcase-controls]')!;
  const detail = root.querySelector<HTMLElement>('[data-showcase-detail]')!;
  const captions = slides.map((slide) => slide.querySelector<HTMLElement>('.music-caption')!.cloneNode(true) as HTMLElement);
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
  let navigating = false;
  let waveFrame = 0;
  let waveTime = 0;
  let playerObserver: IntersectionObserver | undefined;
  let panelRestore: (() => void) | undefined;

  let transition = 0;
  const animations = new Map<HTMLElement, Animation>();
  function visible() {
    const box = slides[selected].querySelector('.music-player')!.getBoundingClientRect();
    return !document.hidden && box.bottom > 0 && box.top < innerHeight && box.right > 0 && box.left < innerWidth;
  }
  function drawWave(time: number) {
    if (time - waveTime >= 32) {
      const phase = time / 260;
      let d = 'M0 40';
      for (let i = 1; i <= 100; i++) {
        const x = i * 6;
        const envelope = Math.sin(Math.PI * i / 100) ** 2;
        const y = 40 + envelope * (Math.sin(x / 12 + phase) * 18 + Math.sin(x / 25 - phase * .7) * 8);
        d += `L${x} ${y.toFixed(2)}`;
      }
      wave.setAttribute('d', d);
      waveTime = time;
    }
    waveFrame = requestAnimationFrame(drawWave);
  }
  function updateWave() {
    cancelAnimationFrame(waveFrame);
    const playing = state === 1 && visible() && !navigating;
    soundStage.classList.toggle('is-playing', playing);
    root.dataset.playback = playing ? 'playing' : 'paused';
    root.querySelector('[data-showcase-state]')!.textContent = playing ? 'NOW PLAYING' : pendingPlay ? 'LOADING SESSION' : state === 0 ? 'SESSION FINISHED' : 'READY TO PLAY';
    if (playing && !reduce.matches) waveFrame = requestAnimationFrame(drawWave);
    else wave.setAttribute('d', playing ? 'M0 40H180Q195 40 205 24T225 40T245 56T265 40T285 20T305 40T325 60T345 40T365 26T385 40H600' : 'M0 40H600');
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
      if (!entry.isIntersecting && !navigating && !document.fullscreenElement) pause();
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
            if (data === 1 && (!visible() || navigating)) { pause(); return; }
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
      const slot = (index - selected + slides.length) % slides.length;
      const active = slot === 0;
      slide.dataset.slot = String(slot);
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
  async function select(index: number, animate = true) {
    index = (index + slides.length) % slides.length;
    if (index === selected && !navigating) { void play(); return; }
    const token = ++transition;
    // Read the currently painted bounds, so another selection can interrupt a rotation.
    const before = slides.map((slide) => slide.getBoundingClientRect());
    for (const animation of animations.values()) animation.cancel();
    animations.clear();
    disposePlayer();
    selected = index;
    navigating = true;
    feedback.textContent = '';
    updateSelection();
    const pending: Promise<unknown>[] = [];
    if (animate && !reduce.matches) {
      for (const [i, slide] of slides.entries()) {
        const after = slide.getBoundingClientRect();
        const from = before[i];
        const animation = slide.animate([
          { transform: `translate(${from.left - after.left}px, ${from.top - after.top}px) scale(${from.width / after.width}, ${from.height / after.height})` },
          { transform: 'translate(0, 0) scale(1, 1)' },
        ], { duration: 280, easing: 'cubic-bezier(.23, 1, .32, 1)' });
        animations.set(slide, animation);
        pending.push(animation.finished.catch(() => {}));
      }
    }
    await Promise.all(pending);
    if (token !== transition) return;
    animations.clear();
    navigating = false;
    // Bring the promoted video back into view if a lower mobile tile was selected.
    if (!document.hidden && !visible()) slides[selected].querySelector('.music-player')!.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    // Selecting a session always plays it; loading events from old selections are ignored.
    void play();
  }
  root.classList.add('is-enhanced');
  controls.hidden = false;
  updateSelection();
  updateWave();
  root.querySelector('[data-showcase-prev]')!.addEventListener('click', () => void select(selected - 1));
  root.querySelector('[data-showcase-next]')!.addEventListener('click', () => void select(selected + 1));
  root.addEventListener('keydown', (event) => {
    if (event.target instanceof HTMLIFrameElement || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    void select(selected + (event.key === 'ArrowRight' ? 1 : -1), false);
  });
  root.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest('[data-youtube-id]');
    if (!button) return;
    const index = slides.findIndex((slide) => slide.contains(button));
    if (index >= 0) void select(index);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  reduce.addEventListener('change', () => {
    if (reduce.matches) for (const animation of animations.values()) animation.finish();
    updateWave();
  });
  new ResizeObserver(() => {
    // A responsive breakpoint must not leave cards between two grid positions.
    for (const animation of animations.values()) animation.finish();
  }).observe(board);
}
