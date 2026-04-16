'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp' | 'consent'>('phone')
  const [consents, setConsents] = useState({ recording: false, ai: false })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

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
    const { error } = await supabase.auth.verifyOtp({
      phone: formatted,
      token: otp,
      type: 'sms',
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
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
      await supabase
        .from('neighbors_users')
        .update({
          consent_recording: true,
          consent_ai_processing: true,
        })
        .eq('id', user.id)
    }
    setLoading(false)
    window.location.href = '/'
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
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
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
        </CardContent>
      </Card>
    </div>
  )
}
