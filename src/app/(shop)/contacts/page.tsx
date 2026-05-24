import type { Metadata } from "next"
import { Mail, Phone, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export const metadata: Metadata = { title: "Contact Us" }

const contactInfo = [
  { icon: Mail, label: "Електронна пошта", value: "support@rtw-rtp.com" },
  { icon: Phone, label: "Телефон", value: "+38 (044) 789-4567" },
  { icon: MapPin, label: "Адреса", value: "вул. Хрещатик, 1, Київ, 01001" },
  { icon: Clock, label: "Години підтримки", value: "24/7 електронною поштою, Пн–Пт 9:00–18:00 по телефону" },
]

export default function ContactsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-14">
        <h1 className="text-4xl font-semibold tracking-tight mb-3">Зв'яжіться з нами</h1>
        <p className="text-muted-foreground text-lg max-w-lg mx-auto">
          Маєте запитання, відгук або потребуєте допомоги з замовленням? Ми тут для вас.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact form */}
        <div className="bg-card rounded-2xl border border-border p-8">
          <h2 className="text-xl font-semibold mb-6">Надіслати повідомлення</h2>
          <form className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first-name" className="text-sm mb-1.5 block">Ім'я</Label>
                <Input id="first-name" placeholder="Іван" />
              </div>
              <div>
                <Label htmlFor="last-name" className="text-sm mb-1.5 block">Прізвище</Label>
                <Input id="last-name" placeholder="Іваненко" />
              </div>
            </div>
            <div>
              <Label htmlFor="email" className="text-sm mb-1.5 block">Електронна пошта</Label>
              <Input id="email" type="email" placeholder="ivan@example.com" />
            </div>
            <div>
              <Label htmlFor="subject" className="text-sm mb-1.5 block">Тема</Label>
              <Input id="subject" placeholder="Запит щодо замовлення, питання про товар…" />
            </div>
            <div>
              <Label htmlFor="message" className="text-sm mb-1.5 block">Повідомлення</Label>
              <Textarea id="message" placeholder="Як ми можемо допомогти?" rows={5} />
            </div>
            <Button size="lg" className="w-full">Надіслати</Button>
          </form>
        </div>

        {/* Contact info */}
        <div className="space-y-6 lg:pt-4">
          <div>
            <h2 className="text-xl font-semibold mb-6">Контактна інформація</h2>
            <div className="space-y-5">
              {contactInfo.map((info) => (
                <div key={info.label} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <info.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{info.label}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-secondary/50 rounded-2xl p-6">
            <h3 className="font-semibold mb-2">Швидка підтримка</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Для відстеження замовлення або повернення ви також можете перевірити свій особистий кабінет.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="/orders">Відстежити замовлення</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
