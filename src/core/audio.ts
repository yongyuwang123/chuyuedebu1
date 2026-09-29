// 音效（Web Audio API 合成，零素材依赖）
// 防坑（README §三）：浏览器自动播放策略要求 AudioContext 在用户首次交互前为 suspended，
// 必须在「点击摇卦」瞬间调用 ensureAudio() 以 resume()，否则第一下摇卦静音。
// 这也契合六爻「心动起卦」——点击即唤醒声音。

let ctx: AudioContext | null = null;

/** 在用户交互（点击摇卦）时调用：创建或恢复 AudioContext */
export function ensureAudio(): AudioContext {
  if (!ctx) {
    const AC: typeof AudioContext =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** 铜钱碰撞「哗啦」声：多个高频金属短音叠加 */
export function playCoinClatter(): void {
  const ac = ensureAudio();
  const t0 = ac.currentTime;
  for (let i = 0; i < 6; i++) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 1700 + Math.random() * 1600;
    const start = t0 + i * 0.045 + Math.random() * 0.02;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.22, start + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.11);
    osc.connect(gain).connect(ac.destination);
    osc.start(start);
    osc.stop(start + 0.12);
  }
}

/** 出卦提示音：低频钟磬余韵 */
export function playChime(): void {
  const ac = ensureAudio();
  const t0 = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(420, t0);
  osc.frequency.exponentialRampToValueAtTime(210, t0 + 1.4);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.3, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.6);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + 1.7);
}
