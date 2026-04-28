export interface Role {
    id: string;
    name: string;
    permissions: string[];
}

export interface Business {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    description?: string;
}

export type PaymentProvider = "PAYME" | "CLICK" | "UZUM" | "STRIPE";
export type PaymentMode = "TEST" | "PROD";
export type PaymentSettingsSourceType = "BUSINESS" | "PLATFORM_DEFAULT";

export interface PaymentSettings {
    id: string;
    businessId?: string | null;
    businessName?: string | null;
    provider: PaymentProvider;
    displayName?: string | null;
    active: boolean;
    primaryConfig: boolean;
    mode: PaymentMode;
    merchantId?: string | null;
    login?: string | null;
    secretConfigured: boolean;
    callbackUrl?: string | null;
    priority?: number | null;
    sourceType?: PaymentSettingsSourceType | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface PaymentSettingsFormValues {
    provider: PaymentProvider;
    displayName: string;
    mode: PaymentMode;
    merchantId: string;
    login: string;
    secretKey: string;
    callbackUrl: string;
    active: boolean;
    primaryConfig: boolean;
    priority: number;
}

export interface BusinessDomain {
    id: string;
    businessId: string;
    businessName: string;
    landingHost: string;
    studentHost: string;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface BusinessDomainFormValues {
    businessId: string;
    landingHost: string;
    studentHost: string;
    active: boolean;
}

export interface User {
    birthDate?: string;
    businessId?: string;
    createdAt?: string;
    firstname: string;
    gender: string;
    id: string;
    lastname: string
    permissionsList: string[];
    phoneNumber: string
    roleName: string
}
