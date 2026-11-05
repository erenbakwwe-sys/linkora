import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  private getBotToken(): string | null {
    return process.env.TELEGRAM_BOT_TOKEN?.trim() || '9265767221:AAH9NANibCi-cRaJkqmcwDGjA8X_ibd4ZKI';
  }

  private getChatId(): string | null {
    return process.env.TELEGRAM_CHAT_ID?.trim() || '6330000122';
  }

  public isConfigured(): boolean {
    return Boolean(this.getBotToken() && this.getChatId());
  }

  /**
   * Sends a formatted HTML message to the configured Telegram chat / group.
   */
  public async sendMessage(htmlText: string, customChatId?: string): Promise<{ success: boolean; error?: string }> {
    const token = this.getBotToken();
    const chatId = customChatId || this.getChatId();

    if (!token || !chatId) {
      this.logger.debug('Telegram notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set.');
      return { success: false, error: 'Telegram credentials not configured.' };
    }

    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: htmlText,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        const errorMsg = data?.description || `HTTP ${response.status}`;
        this.logger.error(`Telegram API error: ${errorMsg}`);
        return { success: false, error: errorMsg };
      }

      this.logger.log(`Telegram notification successfully sent to chat ${chatId}`);
      return { success: true };
    } catch (err: any) {
      this.logger.error(`Failed to send Telegram message: ${err?.message || err}`);
      return { success: false, error: err?.message || 'Network error' };
    }
  }

  /**
   * Formats and dispatches a rich Telegram notification for a public landing page inquiry ("Kostenlos testen").
   */
  public async sendInquiryNotification(payload: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    companyName?: string;
    userType?: string;
    inquiryType?: string;
    project?: string;
    postalCode?: string;
    city?: string;
    message?: string;
    clientIp?: string;
    leadId?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const fullName = `${payload.firstName || ''} ${payload.lastName || ''}`.trim() || 'İsimsiz Ziyaretçi';
    const phone = payload.phone?.trim() || '-';
    const email = payload.email?.trim() || '-';
    const company = payload.companyName?.trim();
    const location = [payload.postalCode, payload.city].filter(Boolean).join(' ') || 'Belirtilmedi';
    const project = payload.project || 'Photovoltaik';
    const message = payload.message?.trim();
    const leadId = payload.leadId || '-';

    // Map User Type
    const userTypeMap: Record<string, string> = {
      COMPANY: '🏢 Şirket / Kurumsal',
      JOB_SEEKER: '💼 İş Başvurusu',
      PRIVATE_INDIVIDUAL: '👤 Bireysel Talep',
    };
    const userTypeStr = userTypeMap[payload.userType || 'COMPANY'] || payload.userType || 'Kurumsal';

    // Map Inquiry Type
    const inquiryMap: Record<string, string> = {
      LEADS: '📊 Lead Satın Alma / Satış',
      DIALER: '📞 Cloud-Dialer & Yazılım Testi',
      COLLABORATION: '🤝 İş Birliği & Acentelik',
      JOB: '💼 İş Başvurusu',
      OTHER: '💬 Genel Bilgi & Danışmanlık',
    };
    const inquiryStr = inquiryMap[payload.inquiryType || 'LEADS'] || payload.inquiryType || 'Danışmanlık';

    const now = new Date();
    const timeStr = now.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const lines: string[] = [
      `🔥 <b>YENİ MÜŞTERİ BAŞVURUSU (Kostenlos Testen)</b>`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `👤 <b>Ad Soyad:</b> <code>${this.escapeHtml(fullName)}</code>`,
      company ? `🏢 <b>Firma:</b> <b>${this.escapeHtml(company)}</b>` : '',
      `🏷️ <b>Başvuru Türü:</b> ${userTypeStr}`,
      `📞 <b>Telefon:</b> <a href="tel:${encodeURIComponent(phone)}">${this.escapeHtml(phone)}</a>`,
      email && email !== '-' ? `✉️ <b>E-posta:</b> <a href="mailto:${encodeURIComponent(email)}">${this.escapeHtml(email)}</a>` : '',
      `📍 <b>Konum:</b> ${this.escapeHtml(location)}`,
      `🎯 <b>Fokus Alanı:</b> <b>${this.escapeHtml(project)}</b>`,
      `📌 <b>Talep Konusu:</b> ${this.escapeHtml(inquiryStr)}`,
    ].filter(Boolean);

    if (message) {
      lines.push(
        `━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `💬 <b>Müşteri Notu:</b>`,
        `<i>"${this.escapeHtml(message)}"</i>`
      );
    }

    lines.push(
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `⏰ <b>Tarih:</b> ${timeStr}`,
      `🌐 <b>Kaynak:</b> <a href="https://calendra-group.online">calendra-group.online</a>`,
      `🆔 <b>Lead ID:</b> <code>${leadId}</code>`
    );

    const messageHtml = lines.join('\n');
    return this.sendMessage(messageHtml);
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
