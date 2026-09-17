import { Fragment, useEffect, useRef, useState } from 'react'

const VIDEO_URL = '/Check/mainframe-video.mp4'

const TYPEWRITER_TEXT =
  'Glad you stopped in. Good taste tends to find us. Now, what are we building?'

const SENSITIVITY = 0.8

function useTypewriter(text: string, speed = 38, startDelay = 600) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)

    let intervalId: number | undefined
    let index = 0

    const delayId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        index += 1
        setDisplayed(text.slice(0, index))

        if (index >= text.length) {
          if (intervalId !== undefined) {
            window.clearInterval(intervalId)
          }
          setDone(true)
        }
      }, speed)
    }, startDelay)

    return () => {
      window.clearTimeout(delayId)
      if (intervalId !== undefined) {
        window.clearInterval(intervalId)
      }
    }
  }, [text, speed, startDelay])

  return { displayed, done }
}

function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const prevXRef = useRef<number | null>(null)
  const targetTimeRef = useRef(0)
  const seekInFlightRef = useRef(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const clampTime = (value: number) => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return 0
      return Math.min(video.duration, Math.max(0, value))
    }

    const seekToTarget = () => {
      if (seekInFlightRef.current) return
      if (!Number.isFinite(video.duration) || video.duration <= 0) return

      const nextTime = clampTime(targetTimeRef.current)
      if (Math.abs(video.currentTime - nextTime) < 0.001) return

      seekInFlightRef.current = true
      video.currentTime = nextTime
    }

    const handleLoadedMetadata = () => {
      targetTimeRef.current = clampTime(Math.min(0.04, video.duration))
      seekToTarget()
    }

    const handleMouseMove = (event: MouseEvent) => {
      const currentX = event.clientX
      const prevX = prevXRef.current
      prevXRef.current = currentX

      if (prevX === null || !Number.isFinite(video.duration) || video.duration <= 0) {
        return
      }

      const delta = currentX - prevX
      const offset = (delta / window.innerWidth) * SENSITIVITY * video.duration
      targetTimeRef.current = clampTime(targetTimeRef.current + offset)
      seekToTarget()
    }

    const handleSeeked = () => {
      seekInFlightRef.current = false

      if (Math.abs(video.currentTime - targetTimeRef.current) > 0.001) {
        seekToTarget()
      }
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('seeked', handleSeeked)
    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('seeked', handleSeeked)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <video
      ref={videoRef}
      className="fixed inset-0 z-0 h-full w-full object-cover object-[70%_center]"
      src={VIDEO_URL}
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
    />
  )
}

const navItems = ['Labs', 'Studio', 'Openings', 'Shop']

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <header className="fixed left-0 top-0 z-10 flex w-full items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
        <a href="#" className="flex items-center gap-3 text-black" aria-label="Mainframe home">
          <span
            className="text-[21px] tracking-tight sm:text-[26px]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Mainframe®
          </span>
          <span
            className="select-none text-[25px] leading-none tracking-[-0.02em] sm:text-[30px]"
            aria-hidden="true"
          >
            ✳︎
          </span>
        </a>

        <nav className="hidden items-center text-[23px] text-black md:flex" aria-label="Primary navigation">
          {navItems.map((item, index) => (
            <Fragment key={item}>
              <a href={`#${item.toLowerCase()}`} className="transition-opacity hover:opacity-60">
                {item}
              </a>
              {index < navItems.length - 1 && <span aria-hidden="true">,&nbsp;</span>}
            </Fragment>
          ))}
        </nav>

        <a
          href="mailto:hello@mainframe.co"
          className="hidden text-[23px] text-black underline underline-offset-2 transition-opacity hover:opacity-60 md:inline"
        >
          Get in touch
        </a>

        <button
          type="button"
          className="relative z-20 flex flex-col gap-[5px] p-1 md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
        >
          <span
            className={`h-[2px] w-6 bg-black transition-transform duration-300 ${
              menuOpen ? 'translate-y-[7px] rotate-45' : ''
            }`}
          />
          <span
            className={`h-[2px] w-6 bg-black transition-opacity duration-300 ${
              menuOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`h-[2px] w-6 bg-black transition-transform duration-300 ${
              menuOpen ? '-translate-y-[7px] -rotate-45' : ''
            }`}
          />
        </button>
      </header>

      <div
        className={`fixed inset-0 z-[9] flex flex-col justify-center gap-8 bg-white/95 px-8 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!menuOpen}
      >
        {navItems.map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="text-[32px] font-medium text-black transition-opacity hover:opacity-60"
            onClick={() => setMenuOpen(false)}
            tabIndex={menuOpen ? 0 : -1}
          >
            {item}
          </a>
        ))}
        <a
          href="mailto:hello@mainframe.co"
          className="text-[32px] font-medium text-black underline underline-offset-2 transition-opacity hover:opacity-60"
          onClick={() => setMenuOpen(false)}
          tabIndex={menuOpen ? 0 : -1}
        >
          Get in touch
        </a>
      </div>
    </>
  )
}

function CopyIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect x="1" y="1" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1" />
      <rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function HeroActions() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 400)
    return () => window.clearTimeout(timer)
  }, [])

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText('hello@mainframe.co')
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = 'hello@mainframe.co'
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
  }

  const whitePills = ['Pitch us an idea', 'Come work here', 'Send a brief hello', 'See how we operate']

  return (
    <div
      className={`flex flex-wrap gap-y-1 transition-[opacity,transform] duration-[400ms] ease-out ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
    >
      {whitePills.map((label) => (
        <a
          key={label}
          href="#"
          className="mx-[0.2em] mb-[0.4em] inline-flex whitespace-nowrap items-center justify-center rounded-full border border-black/10 bg-white px-4 py-[0.3em] text-[13px] text-black transition-colors duration-200 hover:bg-black hover:text-white sm:px-5 sm:text-[15px]"
        >
          {label}
        </a>
      ))}

      <button
        type="button"
        onClick={copyEmail}
        className="mx-[0.2em] mb-[0.4em] inline-flex whitespace-nowrap items-center justify-center gap-2 rounded-full border border-white bg-transparent px-4 py-[0.3em] text-[13px] text-white transition-colors duration-200 hover:bg-white hover:text-black sm:gap-3 sm:px-5 sm:text-[15px]"
        aria-label="Copy hello@mainframe.co to clipboard"
      >
        <span>
          Reach us: <span className="underline underline-offset-1">hello@mainframe.co</span>
        </span>
        <CopyIcon />
      </button>
    </div>
  )
}

function Hero() {
  const { displayed, done } = useTypewriter(TYPEWRITER_TEXT)

  return (
    <main className="relative z-[1] flex h-screen flex-col justify-end overflow-hidden px-5 pb-12 sm:px-8 md:justify-center md:px-10 md:pb-0">
      <div className="relative z-10 max-w-xl">
        <p
          className="pointer-events-none mb-5 select-none whitespace-pre-line text-black sm:mb-6"
          style={{
            fontSize: 'clamp(18px, 4vw, 26px)',
            lineHeight: 1.3,
            fontWeight: 400,
            filter: 'blur(4px)',
          }}
        >
          {'Hey there, meet A.R.I.A,\nMainframe\'s Adaptive Response Interface Agent'}
        </p>

        <p
          className="mb-5 min-h-[54px] text-black sm:mb-6"
          style={{
            fontSize: 'clamp(18px, 4vw, 26px)',
            lineHeight: 1.35,
            fontWeight: 400,
          }}
        >
          {displayed}
          {!done && (
            <span className="typewriter-cursor ml-[2px] inline-block h-[1.1em] w-[2px] align-middle bg-black" />
          )}
        </p>

        <HeroActions />
      </div>
    </main>
  )
}

export default function App() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-neutral-200">
      <BackgroundVideo />
      <Navbar />
      <Hero />
    </div>
  )
}
