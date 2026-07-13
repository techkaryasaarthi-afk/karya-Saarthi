/**
 * Services API — Fetch service catalog data.
 */

import api from './api';

export interface Service {
  id: number;
  name: string;
  title?: string;
  slug: string;
  description: string;
  short_description?: string;
  long_description?: string;
  category: string;
  price_range?: string;
  min_price?: number;
  max_price?: number;
  rating?: number;
  order_count?: number;
  features?: string[];
  is_active: boolean;
}

function formatPriceRange(service: Partial<Service> & { price_min?: number; price_max?: number }) {
  if (service.price_range) {
    return service.price_range;
  }
  if (service.price_min && service.price_max) {
    return `Rs. ${service.price_min.toLocaleString()} - Rs. ${service.price_max.toLocaleString()}`;
  }
  if (service.price_min) {
    return `From Rs. ${service.price_min.toLocaleString()}`;
  }
  return undefined;
}

function normalizeService(service: any): Service {
  return {
    ...service,
    name: service.name || service.title,
    description: service.description || service.short_description || '',
    min_price: service.min_price ?? service.price_min,
    max_price: service.max_price ?? service.price_max,
    order_count: service.order_count ?? service.total_orders,
    price_range: formatPriceRange(service),
  };
}

/** Get all services with optional category filter */
export async function getServicesApi(category?: string) {
  const params = category && category !== 'All' ? `?category=${category}` : '';
  const { data } = await api.get(`/api/services${params}`);
  return {
    ...data,
    services: (data?.services || []).map(normalizeService),
  };
}

/** Get a single service by ID or slug */
export async function getServiceApi(idOrSlug: string | number) {
  const { data } = await api.get(`/api/services/${idOrSlug}`);
  return normalizeService(data?.service || data);
}

/** Search services */
export async function searchServicesApi(query: string) {
  const { data } = await api.get(`/api/services?q=${encodeURIComponent(query)}`);
  return {
    ...data,
    services: (data?.services || []).map(normalizeService),
  };
}
