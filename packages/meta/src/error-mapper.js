"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaErrorMapper = void 0;
class MetaErrorMapper {
    static map(rawError) {
        const response = rawError?.response;
        const errorData = response?.data?.error || rawError;
        const metaCode = errorData?.code;
        const subcode = errorData?.error_subcode;
        const originalMessage = errorData?.message || rawError?.message || 'Unknown Meta API error';
        // 190: Invalid OAuth access token (expired, revoked or password changed)
        if (metaCode === 190) {
            if (subcode === 463 || subcode === 467) {
                return {
                    code: 'TOKEN_EXPIRED',
                    message: originalMessage,
                    userFriendlyMessage: 'Instagram bağlantınızın süresi dolmuş. Hesabınızı yeniden bağlamanız gerekmektedir.',
                    isRetryable: false,
                    httpStatus: 401,
                    subcode,
                };
            }
            return {
                code: 'TOKEN_REVOKED',
                message: originalMessage,
                userFriendlyMessage: 'Instagram erişim izni iptal edilmiş veya geçerliliğini yitirmiş. Lütfen hesabı yeniden bağlayın.',
                isRetryable: false,
                httpStatus: 401,
                subcode,
            };
        }
        // 10, 200-299: Permission Denied
        if (metaCode === 10 || (metaCode >= 200 && metaCode <= 299)) {
            return {
                code: 'META_PERMISSION_DENIED',
                message: originalMessage,
                userFriendlyMessage: 'Instagram hesabınız için gerekli mesajlaşma veya sayfa izinleri eksik. Lütfen OAuth sırasında tüm izinleri onaylayarak yeniden bağlayın.',
                isRetryable: false,
                httpStatus: 403,
                subcode,
            };
        }
        // Rate Limit (4, 17, 32, 613, 80004)
        if (metaCode === 4 || metaCode === 17 || metaCode === 32 || metaCode === 613 || metaCode === 80004 || response?.status === 429) {
            return {
                code: 'META_RATE_LIMIT',
                message: originalMessage,
                userFriendlyMessage: 'Instagram API geçici olarak istek sınırına ulaştı. Sistem otomatik olarak tekrar deneyecektir.',
                isRetryable: true,
                httpStatus: 429,
                subcode,
            };
        }
        // 5xx / Meta Temporary Server Errors (1, 2)
        if (metaCode === 1 || metaCode === 2 || (response?.status && response.status >= 500)) {
            return {
                code: 'META_SERVER_ERROR',
                message: originalMessage,
                userFriendlyMessage: 'Meta (Instagram) sunucularında geçici bir aksaklık yaşanıyor. İstek kuyruğa alındı ve tekrar denenecek.',
                isRetryable: true,
                httpStatus: 503,
                subcode,
            };
        }
        // Message Window Closed (24-hour standard messaging window policy)
        if (metaCode === 100 && subcode === 2018001) {
            return {
                code: 'MESSAGE_WINDOW_CLOSED',
                message: originalMessage,
                userFriendlyMessage: 'Instagram 24 saatlik yanıt penceresi kapandığı için bu kullanıcıya doğrudan standart mesaj gönderilemiyor. Kullanıcının tekrar mesaj atması beklenmelidir.',
                isRetryable: false,
                httpStatus: 400,
                subcode,
            };
        }
        // General Fallback
        return {
            code: 'META_API_ERROR',
            message: originalMessage,
            userFriendlyMessage: 'Instagram işlemi sırasında beklenmeyen bir hata oluştu: ' + originalMessage,
            isRetryable: false,
            httpStatus: response?.status || 500,
            subcode,
        };
    }
}
exports.MetaErrorMapper = MetaErrorMapper;
