'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

const DEFAULT_DISPLAY_NAME = 'Neighbor'
const NAME_MIN = 2
const NAME_MAX = 40

function validateDisplayName(raw: string): { ok: true; value: string } | { ok: false; error: string } {
  const trimmed = raw.trim().replace(/\s+/g, ' ')
  if (trimmed.length < NAME_MIN) {
    return { ok: false, error: `Name must be at least ${NAME_MIN} characters` }
  }
  if (trimmed.length > NAME_MAX) {
    return { ok: false, error: `Name must be at most ${NAME_MAX} characters` }
  }
  // Disallow things that are clearly not names (URLs, control chars).
  if (/[<>{}\\]/.test(trimmed) || /https?:\/\//i.test(trimmed)) {
    return { ok: false, error: 'Please enter a real name' }
  }
  return { ok: true, value: trimmed }
}

// Accept only same-origin paths. Anything else (absolute URL, protocol-relative,
// backslash escapes) falls back to '/' to prevent open-redirect attacks via
// the ?redirectTo= query param.
function safeRedirectTarget(raw: string | null | undefined): string {
  if (!raw) return '/'
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return '/'
  return raw
}

type Step = 'phone' | 'otp' | 'consent' | 'name'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<Step>('phone')
  const [consents, setConsents] = useState({ recording: false, ai: false })
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [bootstrapping, setBootstrapping] = useState(true)
  const supabase = createClient()

  // Resolve ?redirectTo= at the moment we actually redirect, so we don't
  // depend on mount order between effects.
  function goToRedirectTarget() {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    window.location.href = safeRedirectTarget(params.get('redirectTo'))
  }

  useEffect(() => {
    let cancelled = false
    async function bootstrap() {
      const { data: { user } } = await supabase.auth.getUser()
      if (cancelled) return
      if (!user) {
        setBootstrapping(false)
        return
      }
      const { data: profile } = await supabase
        .from('neighbors_users')
        .select('display_name, consent_recording, consent_ai_processing')
        .eq('id', user.id)
        .maybeSingle()
      if (cancelled) return

      const hasConsent = !!profile?.consent_recording && !!profile?.consent_ai_processing
      const hasRealName =
        !!profile?.display_name &&
        profile.display_name.trim() !== '' &&
        profile.display_name.trim() !== DEFAULT_DISPLAY_NAME

      if (hasConsent && hasRealName) {
        goToRedirectTarget()
        return
      }

      setConsents({
        recording: !!profile?.consent_recording,
        ai: !!profile?.consent_ai_processing,
      })
      setDisplayName(hasRealName ? profile!.display_name! : '')
      setStep(hasConsent ? 'name' : 'consent')
      setBootstrapping(false)
    }
    bootstrap()
    return () => { cancelled = true }
  }, [supabase])

  async function handleSendOTP() {
    if (!phone) return
    setLoading(true)
    const formatted = phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`
    const { error } = await supabase.auth.signInWithOtp({ phone: formatted })
    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Code sent!')
    setStep('otp')
  }

  async function handleVerifyOTP() {
    if (otp.length !== 6) return
    setLoading(true)
    const formatted = phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`
    const { data: verifyData, error } = await supabase.auth.verifyOtp({
      phone: formatted,
      token: otp,
      type: 'sms',
    })
    if (error) {
      setLoading(false)
      toast.error(error.message)
      return
    }

    // Resume where the user left off: consent → name → home.
    const userId = verifyData.user?.id
    if (userId) {
      const { data: profile } = await supabase
        .from('neighbors_users')
        .select('display_name, consent_recording, consent_ai_processing')
        .eq('id', userId)
        .maybeSingle()

      const hasConsent = !!profile?.consent_recording && !!profile?.consent_ai_processing
      const hasRealName =
        !!profile?.display_name &&
        profile.display_name.trim() !== '' &&
        profile.display_name.trim() !== DEFAULT_DISPLAY_NAME

      if (hasConsent && hasRealName) {
        goToRedirectTarget()
        return
      }

      setConsents({
        recording: !!profile?.consent_recording,
        ai: !!profile?.consent_ai_processing,
      })
      setDisplayName(hasRealName ? profile!.display_name! : '')
      setLoading(false)
      setStep(hasConsent ? 'name' : 'consent')
      return
    }

    setLoading(false)
    setStep('consent')
  }

  async function handleConsent() {
    if (!consents.recording || !consents.ai) {
      toast.error('Please agree to both to continue')
      return
    }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase
        .from('neighbors_users')
        .update({
          consent_recording: true,
          consent_ai_processing: true,
        })
        .eq('id', user.id)
      if (error) {
        setLoading(false)
        toast.error('Could not save consent — please try again')
        return
      }
    }
    setLoading(false)
    setStep('name')
  }

  async function handleSaveName() {
    const result = validateDisplayName(displayName)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      toast.error('Session expired — please sign in again')
      setStep('phone')
      return
    }
    const { error } = await supabase
      .from('neighbors_users')
      .update({ display_name: result.value })
      .eq('id', user.id)
    setLoading(false)
    if (error) {
      toast.error('Could not save your name — please try again')
      return
    }
    goToRedirectTarget()
  }

  if (bootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Won&apos;t You Be My Neighbor?</CardTitle>
          <CardDescription>
            {step === 'phone' && 'Enter your phone number to get started'}
            {step === 'otp' && 'Enter the code we sent to your phone'}
            {step === 'consent' && 'Before we begin, we need your consent'}
            {step === 'name' && 'What should your neighbors call you?'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                />
              </div>
              <Button className="w-full" onClick={handleSendOTP} disabled={loading}>
                {loading ? 'Sending...' : 'Send code'}
              </Button>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  pattern={REGEXP_ONLY_DIGITS}
                  pasteTransformer={(pasted) => (pasted.match(/\d/g) ?? []).join('').slice(0, 6)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button className="w-full" onClick={handleVerifyOTP} disabled={loading || otp.length !== 6}>
                {loading ? 'Verifying...' : 'Verify'}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setStep('phone')}>
                Use a different number
              </Button>
            </div>
          )}

          {step === 'consent' && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                During events, breakout room conversations are recorded and processed
                to help match you with neighbors who share your interests.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="recording"
                    checked={consents.recording}
                    onCheckedChange={(c) => setConsents((p) => ({ ...p, recording: !!c }))}
                  />
                  <Label htmlFor="recording" className="text-sm leading-relaxed">
                    I consent to having my breakout room conversations recorded
                  </Label>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="ai"
                    checked={consents.ai}
                    onCheckedChange={(c) => setConsents((p) => ({ ...p, ai: !!c }))}
                  />
                  <Label htmlFor="ai" className="text-sm leading-relaxed">
                    I consent to AI processing of my conversations to extract interests and suggest connections
                  </Label>
                </div>
              </div>
              <Button className="w-full" onClick={handleConsent} disabled={loading || !consents.recording || !consents.ai}>
                {loading ? 'Saving...' : 'Continue'}
              </Button>
            </div>
          )}

          {step === 'name' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display-name">Your name</Label>
                <Input
                  id="display-name"
                  type="text"
                  autoComplete="given-name"
                  maxLength={NAME_MAX}
                  placeholder="e.g. Alex Rivera"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  This is how other neighbors will see you in breakout rooms and connections.
                </p>
              </div>
              <Button
                className="w-full"
                onClick={handleSaveName}
                disabled={loading || displayName.trim().length < NAME_MIN}
              >
                {loading ? 'Saving...' : 'Continue'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
