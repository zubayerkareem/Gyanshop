import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'

export default function OrderSuccess() {
  const { state }  = useLocation()
  const navigate   = useNavigate()
  const order_id   = state?.order_id
  const total      = state?.total

  return (
    <div className="container mx-auto max-w-md px-4 py-20 text-center">
      <Card>
        <CardContent className="pt-10 pb-8 px-8 flex flex-col items-center gap-5">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle2 className="h-14 w-14 text-green-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">ধন্যবাদ!</h1>
            <p className="mt-2 text-muted-foreground">
              আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।
            </p>
          </div>

          {order_id && (
            <div className="w-full rounded-lg bg-muted p-4 text-sm">
              <p className="text-muted-foreground">অর্ডার নম্বর</p>
              <p className="text-xl font-bold text-primary">#{order_id}</p>
              {total != null && (
                <p className="mt-1 text-muted-foreground">
                  মোট পরিমাণ: <span className="font-semibold text-foreground">{formatPrice(total)}</span>
                </p>
              )}
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।
          </p>

          <Button className="w-full" onClick={() => navigate('/')}>
            আরও কেনাকাটা করুন
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
