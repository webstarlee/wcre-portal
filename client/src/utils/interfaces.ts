import { Dayjs } from "dayjs";

export interface UserProps {
    id: string;
    fullname: string;
    profile_picture_url: string;
    role: string;
    username: string;
}

export interface ListingProps {
    brokers: string[] | [];
    broker_users: UserProps[] | [];
    id: string;
    listing_cover: string;
    listing_agreement_file_id: string;
    listing_amendment_file_id: string;
    listing_city: string;
    listing_end_date: string;
    listing_entered_date: string;
    listing_lat: string;
    listing_long: string;
    listing_notes: string;
    listing_price: string;
    listing_owner_email: string;
    listing_owner_entity: string;
    listing_owner_name: string;
    listing_owner_phone: string;
    listing_property_type: string;
    listing_start_date: string;
    listing_state: string;
    listing_street: string;
}

export interface SaleProps {
    id: string;
    sale_street: string;
    sale_city: string;
    sale_state: string;
    sale_cover: string;
    sale_sqft: string;
    sale_seller_entity: string;
    sale_seller_name: string;
    sale_seller_email: string;
    sale_seller_phone: string;
    sale_buyer_entity: string;
    sale_buyer_name: string;
    sale_buyer_email: string;
    sale_buyer_phone: string;
    sale_end_date: string;
    sale_property_type: string;
    sale_type: string;
    sale_price: string;
    sale_commission: string;
    brokers: string[];
    sale_agreement_file_id: string;
    sale_notes: string;
    sale_entered_date: string;
    broker_users: UserProps[];
    cover: File | null;
    sale_agreement: File | null;
    sale_end_date_days: Dayjs | null;
}