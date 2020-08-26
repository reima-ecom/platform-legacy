type YotpoResponse<T> = {
  status: {
    code: number,
    message: string,
  }
} & T

interface YotpoPagination {
  page: number,
  per_page: number,
  total: number,
} 

interface YotpoProduct {
  id: number,
  created_at: string,
  updated_at: string,
  blacklisted: boolean,
  average_score: number,
  total_reviews: number,
  url: string,
  external_product_id: string,
  name: string,
  description: string,
  product_specs: { name: string, value: string }[],
  category: {
    id: number,
    name: string,
  },
  images: [{
    original: string,
    square: string,
    facebook: string,
    facebook_square: string,
    kind: string,
  }]
}

type YotpoProductsResponse = YotpoResponse<{
  pagination: YotpoPagination,
  products: YotpoProduct[],
}>;

interface YotpoProductReview {
  id: number,
  score: number,
  votes_up: number,
  votes_down: number,
  content: string,
  title: string,
  created_at: string,
  verified_buyer: boolean,
  source_review_id: any,
  sentiment: number,
  custom_fields: any,
  product_id: number,
  user: {
    user_id: number,
    social_image: string,
    user_type: string,
    is_social_connected: number,
    display_name: string
  }
}

interface YotpoProductBottomline {
  total_review: number,
  average_score: number,
  total_organic_reviews: number,
  organic_average_score: number,
  star_distribution: {
    1: number,
    2: number,
    3: number,
    4: number,
    5: number,
  },
  custom_fields_bottomline: any
}

interface YotpoProductReviewData {
  reviews: YotpoProductReview[],
  bottomline: YotpoProductBottomline,
}

type YotpoProductReviewsResponse = YotpoResponse<{ 
  response: { pagination: YotpoPagination } & YotpoProductReviewData
}>;