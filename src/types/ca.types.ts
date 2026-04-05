export type CAProfile = {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    display_name?: string;
    avatar_url?: string;
    bio?: string;
    tagline?: string;
    icai_membership_number: string;
    firm_name?: string;
    designation?: string;
    years_of_experience: number;
    service_locations: string[];
    is_available: boolean;
    consultation_modes: string[];
    average_rating: number;
    total_reviews: number;
    is_premium: boolean;
    slug: string;
    created_at: string;
    updated_at: string;
}

export type CAService = {
    id: string;
    description: string;
    base_price: number;
    currency: string;
    pricing_type: 'fixed' | 'hourly';
    service_type: string;
}

// For use in the UI where we might join data
export type CAProfileWithServices = CAProfile & {
    services?: CAService[];
    specializations?: { id: string, specialization: string }[];
    reviews?: { id: string, user_id: string, rating: number, comment: string, created_at: string }[];
    badges?: string[];
}
