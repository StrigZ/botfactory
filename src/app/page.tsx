import Link from 'next/link';

import Header from '~/components/LandingPage/Header/Header';
import { LatestPost } from '~/components/post';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import { auth } from '~/server/auth';
import { HydrateClient, api } from '~/trpc/server';

export default async function Landing() {
  const hello = await api.post.hello({ text: 'from tRPC' });
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] pt-[68px] text-white">
        <Header />
        <section className="container flex flex-col items-center justify-between gap-12 px-4 py-16 [&>div]:scroll-m-25">
          <h1>Создавайте мощные Telegram-боты без кода за минуты</h1>
          <h2>
            Бесплатный конструктор с drag-n-drop, расширенные фичи по подписке
          </h2>
          <Separator />
          <div id="why-us">
            <h2>Почему именно мы</h2>
            <ul>
              <li>
                <p>Интуитивный редактор</p>
                <p>
                  Добавляйте триггеры, кнопки и интеграции одним перетаскиванием
                </p>
              </li>
              <li>
                <p>Мгновенный хостинг</p>
                <p>Ваш бот в сети сразу после сохранения настроек</p>
              </li>
              <li>
                <p>Гибкая подписка</p>
                <p>
                  Бесплатно: до 3 ботов и 10 000 сообщений в месяц Pro:
                  неограниченно + Webhook, CRM, аналитику и приоритетную
                  поддержку
                </p>
              </li>
              <li>
                <p>Полная документация</p>
                <p>Шаг-за-шаг инструкции и примеры готовых сценариев</p>
              </li>
            </ul>
          </div>
          <Separator />
          <div id="how-it-works">
            <h2>Как это работает</h2>
            <ol>
              <li>Зарегистрируйтесь через Telegram</li>
              <li>Создайте нового бота в личном кабинете</li>
              <li>Настройте логику – echo, кнопки, условия и внешние API</li>
              <li>Запустите и делитесь ссылкой на вашего помощника</li>
            </ol>
          </div>
          <Separator />
          <div id="trust-us">
            <h2>Доверьтесь профессионалам</h2>
            <p>
              Запускайте проекты быстро, без разработчиков и сложных настроек –
              начните уже сегодня!
            </p>
          </div>
        </section>
      </main>
    </HydrateClient>
  );
}
