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
    studentsCount?: number;
    ownerId?: string;
    ownerFullName?: string;
    assistants?: Record<string, string>;
    members?: Array<{
        id: string;
        fullName: string;
        phone: string;
        role: string;
    }>;
}

export type PaymentProvider = "PAYME" | "CLICK" | "UZUM" | "STRIPE";
export type PaymentMode = "TEST" | "PROD";
export type PaymentSettingsSourceType = "BUSINESS" | "PLATFORM_DEFAULT";
export type PaymentSettingsUsage = "DEFAULT" | "BUSINESS_WALLET_TOP_UP";

export interface PaymentProviderSettingsResponse {
    id: string;
    businessId?: string | null;
    businessName?: string | null;
    provider: PaymentProvider;
    usage?: PaymentSettingsUsage | null;
    displayName?: string | null;
    active: boolean;
    primaryConfig: boolean;
    mode: PaymentMode;
    merchantId?: string | null;
    login?: string | null;
    secretConfigured: boolean;
    testMerchantId?: string | null;
    testLogin?: string | null;
    testSecretConfigured: boolean;
    prodMerchantId?: string | null;
    prodLogin?: string | null;
    prodSecretConfigured: boolean;
    callbackUrl?: string | null;
    priority?: number | null;
    sourceType?: PaymentSettingsSourceType | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface PaymentProviderSettingsRequest {
    provider: PaymentProvider;
    usage?: PaymentSettingsUsage | null;
    displayName: string;
    active: boolean;
    primaryConfig: boolean;
    mode: PaymentMode;
    merchantId?: string | null;
    login?: string | null;
    secretKey?: string | null;
    testMerchantId: string;
    testLogin: string;
    testSecretKey: string;
    prodMerchantId: string;
    prodLogin: string;
    prodSecretKey: string;
    callbackUrl: string;
    priority: number;
}

export type PaymentSettings = PaymentProviderSettingsResponse;
export type PaymentSettingsFormValues = PaymentProviderSettingsRequest;

export interface CourseModerationListResponse {
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
    courses: CourseModerationCourse[];
}

export interface CourseModerationCourse {
    id: string;
    name: string;
    description?: string;
    status: string;
    statusNote?: string | null;
    isPublished: boolean;
    active: boolean;
    businessId?: string | null;
    studentsCount: number;
    price?: number | null;
    lessonsCount: number;
    createdAt?: string;
    publishedAt?: string | null;
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

export interface CourseLanguage {
    id: string;
    name: string;
    code: string;
    active: boolean;
}

export interface CourseLanguageFormValues {
    name: string;
    code: string;
}

export interface TaxonomyCategory {
    id: string;
    name: string;
    description?: string | null;
}

export interface TaxonomySubcategory {
    id: string;
    name: string;
    description?: string | null;
    categoryId: string;
    categoryName: string;
}

export interface TaxonomySkillTag {
    id: string;
    name: string;
    description?: string | null;
}

export interface TaxonomyCategoryFormValues {
    name: string;
    description: string;
}

export interface TaxonomySubcategoryFormValues {
    name: string;
    description: string;
    categoryId: string;
}

export interface TaxonomySkillTagFormValues {
    name: string;
    description: string;
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
