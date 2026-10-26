'use strict';

// Precise Philippine-local event time; visitors overseas see the same countdown.
const PARTY_START = Date.parse('2026-11-15T14:00:00+08:00');
const $ = id => document.getElementById(id);
const fmt = value => String(value).padStart(2, '0');

function updateCountdown() {
  const remaining = Math.max(0, PARTY_START - Date.now());
  const secondsTotal = Math.floor(remaining / 1000);
  const days = Math.floor(secondsTotal / 86400);
  const hours = Math.floor((secondsTotal % 86400) / 3600);
  const minutes = Math.floor((secondsTotal % 3600) / 60);
  const seconds = secondsTotal % 60;
  $('days').textContent = fmt(days);
  $('hours').textContent = fmt(hours);
  $('minutes').textContent = fmt(minutes);
  $('seconds').textContent = fmt(seconds);
  $('countdownStatus').textContent = remaining === 0
    ? 'The celebration has arrived!'
    : `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds until the party.`;
}
updateCountdown();
// Use the next second boundary to avoid accumulated drift from an always-running timer.
setInterval(updateCountdown, 1000);
window.addEventListener('pageshow', updateCountdown);
document.addEventListener('visibilitychange', () => { if (!document.hidden) updateCountdown(); });

const calendarDialog = $('calendarDialog');
function showCalendar() { if (!calendarDialog.open) calendarDialog.showModal(); }
$('dateHotspot').addEventListener('click', showCalendar);
$('timeHotspot').addEventListener('click', showCalendar);
$('closeCalendar').addEventListener('click', () => calendarDialog.close());
calendarDialog.addEventListener('click', event => { if (event.target === calendarDialog) calendarDialog.close(); });

// The invitation specifies a start time only. An editable one-hour placeholder
// is necessary for broad compatibility with calendar programs.
const icsEvent = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//Mikael Birthday Invitation//EN',
  'CALSCALE:GREGORIAN',
  'METHOD:PUBLISH',
  'BEGIN:VEVENT',
  'UID:mikael-7th-birthday-20261115@birthday-invitation.local',
  'DTSTAMP:20261026T000000Z',
  'DTSTART:20261115T060000Z',
  'DTEND:20261115T070000Z',
  'SUMMARY:Mikael\'s 7th Birthday',
  'LOCATION:Antel Grand Village - Grand Ballroom\\, Bacao 2\\, General Trias\\, Cavite\\, Philippines',
  'DESCRIPTION:Get ready to catch some fun!\\nTrainer reminder: Socks are a must for the inflatable play area.',
  'END:VEVENT',
  'END:VCALENDAR',
  ''
].join('\r\n');
$('downloadIcs').addEventListener('click', () => {
  const file = new Blob([icsEvent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Mikaels-7th-Birthday.ics';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

const soundToggle = $('soundToggle');
const soundLabel = $('soundLabel');
const soundtrack = $('soundtrack');
const musicPanel = $('musicPanel');
const musicFile = $('musicFile');
let localAudioUrl = null;

function setPlaying(isPlaying) {
  soundToggle.setAttribute('aria-pressed', String(isPlaying));
  soundLabel.textContent = isPlaying ? 'Music: On' : 'Music: Off';
}
function openMusicPanel() { musicPanel.hidden = false; }
function closeMusicPanel() { musicPanel.hidden = true; }
async function startMusic() {
  try {
    await soundtrack.play();
    setPlaying(true);
    closeMusicPanel();
  } catch (error) {
    setPlaying(false);
    openMusicPanel();
  }
}
soundToggle.addEventListener('click', async () => {
  if (!soundtrack.paused) {
    soundtrack.pause();
    setPlaying(false);
    return;
  }
  await startMusic();
});
$('closeMusic').addEventListener('click', closeMusicPanel);
$('chooseMusic').addEventListener('click', () => musicFile.click());
musicFile.addEventListener('change', async () => {
  const file = musicFile.files && musicFile.files[0];
  if (!file) return;
  if (localAudioUrl) URL.revokeObjectURL(localAudioUrl);
  localAudioUrl = URL.createObjectURL(file);
  soundtrack.src = localAudioUrl;
  soundtrack.load();
  await startMusic();
});
soundtrack.addEventListener('ended', () => setPlaying(false));
soundtrack.addEventListener('pause', () => setPlaying(false));
soundtrack.addEventListener('error', () => { setPlaying(false); if (!soundtrack.paused) openMusicPanel(); });
document.addEventListener('click', event => {
  if (!musicPanel.hidden && !event.target.closest('.sound-wrapper')) closeMusicPanel();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeMusicPanel();
});
