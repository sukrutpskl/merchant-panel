# Swagger API Summary

## Endpoints
- **POST** `/api/merchant/auth/login`  Body: LoginRequest -> MerchantAuthResponseApiResponse
- **POST** `/api/merchant/auth/refresh-token`  Body: RefreshTokenRequest -> MerchantAuthResponseApiResponse
- **POST** `/api/merchant/auth/logout`  -> StringApiResponse
- **GET** `/api/merchant/coupons`  -> CouponListApiResponse
- **POST** `/api/merchant/coupons`  Body: Coupon -> CouponApiResponse
- **PUT** `/api/merchant/coupons/{id}` | Params: id (path) Body: Coupon -> CouponApiResponse
- **DELETE** `/api/merchant/coupons/{id}` | Params: id (path) -> StringApiResponse
- **GET** `/api/merchant/dashboard/stats`  -> ObjectApiResponse
- **GET** `/api/merchant/dashboard/today-summary`  -> ObjectApiResponse
- **GET** `/api/merchant/dashboard/recent-orders` | Params: count (query) -> ObjectApiResponse
- **GET** `/api/merchant/menu/categories`  -> CategoryDtoListApiResponse
- **POST** `/api/merchant/menu/categories`  Body: CreateCategoryRequest -> CategoryDtoApiResponse
- **DELETE** `/api/merchant/menu/categories/{categoryId}` | Params: categoryId (path) -> StringApiResponse
- **GET** `/api/merchant/menu/categories/{categoryId}/products` | Params: categoryId (path) -> ProductDtoListApiResponse
- **GET** `/api/merchants/{merchantId}/orders` | Params: merchantId (path) -> OrderDtoListApiResponse
- **PUT** `/api/merchants/{merchantId}/orders/{orderId}/status` | Params: merchantId (path), orderId (path) Body: UpdateOrderStatusRequest -> OrderDtoApiResponse
- **GET** `/api/merchant/products` | Params: categoryId (query), search (query), page (query), pageSize (query) -> ProductDtoListApiResponse
- **POST** `/api/merchant/products`  Body: CreateProductRequest -> ProductDtoApiResponse
- **GET** `/api/merchant/products/{id}` | Params: id (path) -> ProductDtoApiResponse
- **PUT** `/api/merchant/products/{id}/availability` | Params: id (path) Body: UpdateProductAvailabilityRequest -> StringApiResponse
- **GET** `/api/merchant/reports/sales` | Params: startDate (query), endDate (query) -> ObjectApiResponse
- **GET** `/api/Merchants/list` | Params: Search (query), Latitude (query), Longitude (query), RadiusKm (query), MinRating (query), IsOpen (query), SortBy (query), Page (query), PageSize (query) -> MerchantDtoPagedResultApiResponse
- **GET** `/api/Merchants`  -> MerchantDtoListApiResponse
- **POST** `/api/Merchants`  Body: CreateMerchantRequest -> MerchantDtoApiResponse
- **GET** `/api/Merchants/nearby` | Params: latitude (query), longitude (query), radiusKm (query) -> MerchantDtoListApiResponse
- **GET** `/api/Merchants/featured` | Params: type (query) -> MerchantDtoListApiResponse
- **GET** `/api/Merchants/{id}` | Params: id (path) -> MerchantDetailDtoApiResponse
- **GET** `/api/Merchants/{id}/working-hours` | Params: id (path) -> WorkingHourDtoListApiResponse
- **GET** `/api/Merchants/{id}/delivery-info` | Params: id (path) -> DeliveryConfigDtoListApiResponse
- **GET** `/api/Merchants/my-profile`  -> MerchantDetailDtoApiResponse
- **PUT** `/api/Merchants/my-profile`  Body: UpdateMerchantRequest -> MerchantDtoApiResponse
- **GET** `/api/merchant/settings/working-hours`  -> WorkingHourDtoListApiResponse
- **PUT** `/api/merchant/settings/working-hours`  Body: Array of WorkingHourDto -> StringApiResponse
- **GET** `/api/merchant/settings/delivery`  -> DeliveryConfigDtoListApiResponse
- **PUT** `/api/merchant/settings/delivery`  Body: Array of DeliveryConfigDto -> StringApiResponse

## Models
### Address
- `id`: string
- `createdAt`: string
- `updatedAt`: string (nullable)
- `isDeleted`: boolean
- `title`: string (nullable)
- `addressLine`: string (nullable)
- `district`: string (nullable)
- `city`: string (nullable)
- `latitude`: number
- `longitude`: number
- `note`: string (nullable)
- `isDefault`: boolean
- `userId`: string
- `user`: User

### CategoryDto
- `id`: string
- `name`: string (nullable)
- `description`: string (nullable)
- `imageUrl`: string (nullable)
- `displayOrder`: integer

### CategoryDtoApiResponse
- `success`: boolean
- `message`: string (nullable)
- `data`: CategoryDto
- `errors`: Array<string> (nullable)

### CategoryDtoListApiResponse
- `success`: boolean
- `message`: string (nullable)
- `data`: Array<CategoryDto> (nullable)
- `errors`: Array<string> (nullable)

### Coupon
- `id`: string
- `createdAt`: string
- `updatedAt`: string (nullable)
- `isDeleted`: boolean
- `code`: string (nullable)
- `description`: string (nullable)
- `type`: DiscountType
- `value`: number
- `minimumOrderAmount`: number (nullable)
- `maxDiscountAmount`: number (nullable)
- `validFrom`: string
- `validUntil`: string
- `usageLimit`: integer
- `usageCount`: integer
- `limitPerUser`: integer
- `isActive`: boolean
- `merchantId`: string (nullable)
- `merchant`: Merchant
- `usages`: Array<CouponUsage> (nullable)

### CouponApiResponse
- `success`: boolean
- `message`: string (nullable)
- `data`: Coupon
- `errors`: Array<string> (nullable)

### CouponListApiResponse
- `success`: boolean
- `message`: string (nullable)
- `data`: Array<Coupon> (nullable)
- `errors`: Array<string> (nullable)

### CouponUsage
- `id`: string
- `createdAt`: string
- `updatedAt`: string (nullable)
- `isDeleted`: boolean
- `couponId`: string
- `coupon`: Coupon
- `userId`: string
- `user`: User
- `orderId`: string
- `order`: Order
- `discountAmount`: number

### CreateCategoryRequest
- `name`: string (nullable)
- `description`: string (nullable)
- `imageUrl`: string (nullable)
- `displayOrder`: integer

### CreateMerchantRequest
- `name`: string (nullable)
- `description`: string (nullable)
- `phone`: string (nullable)
- `email`: string (nullable)
- `address`: string (nullable)
- `latitude`: number
- `longitude`: number

### CreateProductOptionGroupRequest
- `name`: string (nullable)
- `isRequired`: boolean
- `allowMultiple`: boolean
- `minSelection`: integer
- `maxSelection`: integer
- `options`: Array<CreateProductOptionRequest> (nullable)

### CreateProductOptionRequest
- `name`: string (nullable)
- `priceAdjustment`: number

### CreateProductRequest
- `name`: string (nullable)
- `description`: string (nullable)
- `imageUrl`: string (nullable)
- `price`: number
- `categoryId`: string
- `variants`: Array<CreateProductVariantRequest> (nullable)
- `optionGroups`: Array<CreateProductOptionGroupRequest> (nullable)

### CreateProductVariantRequest
- `name`: string (nullable)
- `price`: number
- `stock`: integer
- `attributes`: object (nullable)

### DayOfWeek
Enum: 0, 1, 2, 3, 4, 5, 6

### Dealer
- `id`: string
- `createdAt`: string
- `updatedAt`: string (nullable)
- `isDeleted`: boolean
- `userId`: string
- `user`: User
- `city`: string (nullable)
- `companyName`: string (nullable)
- `contactPhone`: string (nullable)
- `contactEmail`: string (nullable)
- `isActive`: boolean
- `registeredMerchants`: Array<Merchant> (nullable)

### DeliveryConfig
- `id`: string
- `createdAt`: string
- `updatedAt`: string (nullable)
- `isDeleted`: boolean
- `merchantId`: string
- `maxDistanceKm`: number
- `minOrderAmount`: number
- `fee`: number
- `merchant`: Merchant

### DeliveryConfigDto
- `maxDistanceKm`: number
- `minOrderAmount`: number
- `fee`: number

### DeliveryConfigDtoListApiResponse
- `success`: boolean
- `message`: string (nullable)
- `data`: Array<DeliveryConfigDto> (nullable)
- `errors`: Array<string> (nullable)

### DiscountType
Enum: 0, 1

### LoginRequest
- `phoneOrEmail`: string (nullable)
- `password`: string (nullable)

### Merchant
- `id`: string
- `createdAt`: string
- `updatedAt`: string (nullable)
- `isDeleted`: boolean
- `name`: string (nullable)
- `description`: string (nullable)
- `logoUrl`: string (nullable)
- `coverImageUrl`: string (nullable)
- `phone`: string (nullable)
- `email`: string (nullable)
- `address`: string (nullable)
- `latitude`: number
- `longitude`: number
- `isOpen`: boolean
- `isVerified`: boolean
- `minimumOrderAmount`: number
- `deliveryFee`: number
- `rating`: number
- `isActive`: boolean
- `city`: string (nullable)
- `sector`: string (nullable)
- `autoAcceptOrders`: boolean
- `preparationTimeMinutes`: integer
- `ownerId`: string
- `owner`: User
- `registeredByDealerId`: string (nullable)
- `registeredByDealer`: Dealer
- `workingHours`: Array<WorkingHour> (nullable)
- `deliveryConfigs`: Array<DeliveryConfig> (nullable)

### MerchantAuthResponse
- `accessToken`: string (nullable)
- `refreshToken`: string (nullable)
- `expiresAt`: string
- `user`: UserDto
- `merchant`: MerchantDto

### MerchantAuthResponseApiResponse
- `success`: boolean
- `message`: string (nullable)
- `data`: MerchantAuthResponse
- `errors`: Array<string> (nullable)

### MerchantDetailDto
- `id`: string
- `name`: string (nullable)
- `description`: string (nullable)
- `logoUrl`: string (nullable)
- `coverImageUrl`: string (nullable)
- `phone`: string (nullable)
- `email`: string (nullable)
- `address`: string (nullable)
- `city`: string (nullable)
- `latitude`: number
- `longitude`: number
- `isOpen`: boolean
- `minimumOrderAmount`: number
- `deliveryFee`: number
- `rating`: number
- `isVerified`: boolean
- `workingHours`: Array<WorkingHourDto> (nullable)
- `deliveryConfigs`: Array<DeliveryConfigDto> (nullable)

### MerchantDetailDtoApiResponse
- `success`: boolean
- `message`: string (nullable)
- `data`: MerchantDetailDto
- `errors`: Array<string> (nullable)

### MerchantDto
- `id`: string
- `name`: string (nullable)
- `description`: string (nullable)
- `logoUrl`: string (nullable)
- `coverImageUrl`: string (nullable)
- `phone`: string (nullable)
- `email`: string (nullable)
- `address`: string (nullable)
- `city`: string (nullable)
- `latitude`: number
- `longitude`: number
- `isOpen`: boolean
- `minimumOrderAmount`: number
- `deliveryFee`: number
- `rating`: number
- `isVerified`: boolean

### MerchantDtoApiResponse
- `success`: boolean
- `message`: string (nullable)
- `data`: MerchantDto
- `errors`: Array<string> (nullable)

### MerchantDtoListApiResponse
- `success`: boolean
- `message`: string (nullable)
- `data`: Array<MerchantDto> (nullable)
- `errors`: Array<string> (nullable)

### MerchantDtoPagedResult
- `data`: Array<MerchantDto> (nullable)
- `page`: integer
- `pageSize`: integer
- `totalCount`: integer
- `totalPages`: integer
- `hasPrevious`: boolean
- `hasNext`: boolean

### MerchantDtoPagedResultApiResponse
- `success`: boolean
- `message`: string (nullable)
- `data`: MerchantDtoPagedResult
- `errors`: Array<string> (nullable)

### ObjectApiResponse
- `success`: boolean
- `message`: string (nullable)
- `data`: undefined (nullable)
- `errors`: Array<string> (nullable)

### Order
- `id`: string
- `createdAt`: string
- `updatedAt`: string (nullable)
- `isDeleted`: boolean
- `orderNumber`: string (nullable)
- `status`: OrderStatus
- `note`: string (nullable)
- `subTotal`: number
- `deliveryFee`: number
- `discount`: number
- `totalAmount`: number
- `userId`: string
- `user`: User
- `merchantId`: string
- `merchant`: Merchant
- `addressId`: string
- `address`: Address
- `items`: Array<OrderItem> (nullable)
- `history`: Array<OrderHistory> (nullable)

### OrderDto
- `id`: string
- `orderNumber`: string (nullable)
- `status`: string (nullable)
- `statusText`: string (nullable)
- `createdAt`: string
- `note`: string (nullable)
- `subTotal`: number
- `deliveryFee`: number
- `discount`: number
- `totalAmount`: number
- `merchantId`: string
- `merchantName`: string (nullable)
- `merchantPhone`: string (nullable)
- `addressId`: string
- `addressTitle`: string (nullable)
- `fullAddress`: string (nullable)
- `items`: Array<OrderItemDto> (nullable)
- `history`: Array<OrderHistoryDto> (nullable)

### OrderDtoApiResponse
- `success`: boolean
- `message`: string (nullable)
- `data`: OrderDto
- `errors`: Array<string> (nullable)

### OrderDtoListApiResponse
- `success`: boolean
- `message`: string (nullable)
- `data`: Array<OrderDto> (nullable)
- `errors`: Array<string> (nullable)

### OrderHistory
- `id`: string
- `createdAt`: string
- `updatedAt`: string (nullable)
- `isDeleted`: boolean
- `orderId`: string
- `order`: Order
- `status`: OrderStatus
- `description`: string (nullable)
- `changedAt`: string

### OrderHistoryDto
- `status`: string (nullable)
- `description`: string (nullable)
- `changedAt`: string

### OrderItem
- `id`: string
- `createdAt`: string
- `updatedAt`: string (nullable)
- `isDeleted`: boolean
- `orderId`: string
- `order`: Order
- `productId`: string
- `productName`: string (nullable)
- `unitPrice`: number
- `quantity`: integer
- `totalPrice`: number
- `selectedOptions`: Array<OrderItemOption> (nullable)

### OrderItemDto
- `id`: string
- `productId`: string
- `productName`: string (nullable)
- `productImageUrl`: string (nullable)
- `unitPrice`: number
- `quantity`: integer
- `totalPrice`: number
- `selectedOptions`: Array<OrderItemOptionDto> (nullable)

### OrderItemOption
- `id`: string
- `createdAt`: string
- `updatedAt`: string (nullable)
- `isDeleted`: boolean
- `orderItemId`: string
- `orderItem`: OrderItem
- `productOptionId`: string
- `optionName`: string (nullable)
- `priceAdjustment`: number

### OrderItemOptionDto
- `optionName`: string (nullable)
- `priceAdjustment`: number

### OrderStatus
Enum: 0, 1, 2, 3, 4, 5, 6, 7

### ProductDto
- `id`: string
- `name`: string (nullable)
- `description`: string (nullable)
- `imageUrl`: string (nullable)
- `price`: number
- `isAvailable`: boolean
- `categoryId`: string
- `isSponsored`: boolean
- `isFreeShipping`: boolean
- `deliveryMessage`: string (nullable)
- `discountPercentage`: integer (nullable)
- `brand`: string (nullable)
- `color`: string (nullable)
- `variants`: Array<ProductVariantDto> (nullable)
- `optionGroups`: Array<ProductOptionGroupDto> (nullable)

### ProductDtoApiResponse
- `success`: boolean
- `message`: string (nullable)
- `data`: ProductDto
- `errors`: Array<string> (nullable)

### ProductDtoListApiResponse
- `success`: boolean
- `message`: string (nullable)
- `data`: Array<ProductDto> (nullable)
- `errors`: Array<string> (nullable)

### ProductOptionDto
- `id`: string
- `name`: string (nullable)
- `priceAdjustment`: number
- `isAvailable`: boolean

### ProductOptionGroupDto
- `id`: string
- `name`: string (nullable)
- `isRequired`: boolean
- `allowMultiple`: boolean
- `minSelection`: integer
- `maxSelection`: integer
- `options`: Array<ProductOptionDto> (nullable)

### ProductVariantDto
- `id`: string
- `name`: string (nullable)
- `price`: number
- `stock`: integer
- `attributes`: object (nullable)

### RefreshTokenRequest
- `accessToken`: string (nullable)
- `refreshToken`: string (nullable)

### StringApiResponse
- `success`: boolean
- `message`: string (nullable)
- `data`: string (nullable)
- `errors`: Array<string> (nullable)

### UpdateMerchantRequest
- `name`: string (nullable)
- `description`: string (nullable)
- `phone`: string (nullable)
- `address`: string (nullable)
- `minimumOrderAmount`: number
- `deliveryFee`: number
- `autoAcceptOrders`: boolean
- `preparationTimeMinutes`: integer

### UpdateOrderStatusRequest
- `status`: OrderStatus
- `description`: string (nullable)

### UpdateProductAvailabilityRequest
- `isAvailable`: boolean

### User
- `id`: string
- `userName`: string (nullable)
- `normalizedUserName`: string (nullable)
- `email`: string (nullable)
- `normalizedEmail`: string (nullable)
- `emailConfirmed`: boolean
- `passwordHash`: string (nullable)
- `securityStamp`: string (nullable)
- `concurrencyStamp`: string (nullable)
- `phoneNumber`: string (nullable)
- `phoneNumberConfirmed`: boolean
- `twoFactorEnabled`: boolean
- `lockoutEnd`: string (nullable)
- `lockoutEnabled`: boolean
- `accessFailedCount`: integer
- `firstName`: string (nullable)
- `lastName`: string (nullable)
- `createdAt`: string
- `isActive`: boolean
- `refreshToken`: string (nullable)
- `refreshTokenExpiryTime`: string (nullable)
- `addresses`: Array<Address> (nullable)

### UserDto
- `id`: string
- `firstName`: string (nullable)
- `lastName`: string (nullable)
- `email`: string (nullable)
- `phone`: string (nullable)
- `roles`: Array<string> (nullable)

### WorkingHour
- `id`: string
- `createdAt`: string
- `updatedAt`: string (nullable)
- `isDeleted`: boolean
- `merchantId`: string
- `dayOfWeek`: DayOfWeek
- `openTime`: string
- `closeTime`: string
- `isClosed`: boolean
- `merchant`: Merchant

### WorkingHourDto
- `dayOfWeek`: DayOfWeek
- `openTime`: string (nullable)
- `closeTime`: string (nullable)
- `isClosed`: boolean

### WorkingHourDtoListApiResponse
- `success`: boolean
- `message`: string (nullable)
- `data`: Array<WorkingHourDto> (nullable)
- `errors`: Array<string> (nullable)
