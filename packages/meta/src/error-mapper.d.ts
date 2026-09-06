export interface MetaApiErrorDetails {
    code: string;
    message: string;
    userFriendlyMessage: string;
    isRetryable: boolean;
    httpStatus?: number;
    subcode?: number;
}
export declare class MetaErrorMapper {
    static map(rawError: any): MetaApiErrorDetails;
}
