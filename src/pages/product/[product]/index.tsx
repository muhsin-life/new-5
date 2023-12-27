import AddToCartButton from "@/components/AddtoCartButton";
import { Breadcrumbs } from "@/components/BreadCrumb";
import { Icons } from "@/components/Icons";
import ImageSlider from "@/components/ImageSlider";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { useProduct } from "@/components/hooks/useData";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import getProduct from "@/helpers/api/getProduct";
import { getPriceDataByLocale } from "@/helpers/general";
import { cn, formatPrice } from "@/lib/utils";
import { SingleProductProps } from "@/types/product";
import { PriceElement } from "@/types/products";
import { QueryClient, dehydrate } from "@tanstack/react-query";
import { Check, MinusIcon, PlusIcon, Shield, Star } from "lucide-react";
import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { useState } from "react";
import type SwiperType from "swiper";
import { Pagination, Thumbs } from "swiper/modules";

interface ProductPageProps {
  slug: string;
  locale: locale;
}

export default function Page({ slug, locale }: ProductPageProps) {
  const { data, refetch } = useProduct(slug, locale);
  const [swiper, setSwiper] = useState<SwiperType>();

  const product = data?.data.product;
  const productRating = data?.data.product_rating;
  const productReviews = data?.data.product_reviews;
  const relatedProducts = data?.data.related_products;

  const validUrls = product
    ? product?.images.gallery_images && product.images.gallery_images.length > 0
      ? product.images.gallery_images.map(({ image }) => image)
      : [product?.images.featured_image]
    : ["https://www.lifepharmacy.com/images/page-header-bg.jpg"];

  const priceData = getPriceDataByLocale(
    locale as locale,
    product?.prices as PriceElement[]
  );

  return (
    data && (
      <MaxWidthWrapper className="bg-white">
        <Breadcrumbs
          segments={[
            {
              title: "Home",
              href: "/",
            },
            {
              title: "Products",
              href: "/",
            },
          ]}
        />
        <div className="bg-white">
          <div className="grid grid-cols-12 lg:gap-x-8">
            {/* Product Details */}
            <div className="col-span-8">
              <div className="grid grid-cols-2 gap-x-5">
                <div className="mt-7">
                  <div className="aspect-square rounded-lg">
                    <ImageSlider urls={validUrls} swiperThumbs={swiper} />
                  </div>
                  <div className="mt-2 flex justify-center">
                    <Swiper
                      pagination={{
                        dynamicBullets: true,
                        renderBullet: (_, className) => {
                          return `<span class="rounded-full transition ${className}"></span>`;
                        },
                      }}
                      onSwiper={(swiper) => setSwiper(swiper)}
                      spaceBetween={10}
                      modules={[Pagination, Thumbs]}
                      slidesPerView={4}
                      className="h-full "
                    >
                      {product?.images.gallery_images?.map((image, i) => (
                        <SwiperSlide key={i} className="!w-fit">
                          <Image
                            src={image.medium}
                            height={90}
                            width={90}
                            alt={i.toString()}
                            className="rounded-lg border"
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                </div>

                <div className="">
                  <div className="mt-4 flex flex-col gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                      {product?.title}
                    </h1>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5 items-center">
                        {Array(parseInt(product?.rating ?? "0")).fill(
                          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        )}
                        {Array(5 - parseInt(product?.rating ?? "0")).fill(
                          <Star className="w-4 h-4 fill-white text-amber-500" />
                        )}
                      </div>
                      <p className="text-slate-600 text-sm ">
                        {productRating?.rating} - (
                        {productRating?.number_of_reviews} reviews)
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1  line-clamp-1">
                      {product?.categories?.map((cat) => (
                        <Link
                          href="/"
                          className={cn(
                            buttonVariants({
                              variant: "secondary",
                              size: "sm",
                            }),
                            " text-xs py-0.5 h-7"
                          )}
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <section className="mt-4">
                    <div className="flex items-center">
                      {product?.sale_price &&
                      product?.sale_price !== product.filter_price ? (
                        <div className="flex items-center gap-3 mt-1 line-clamp-1">
                          <p className=" font-medium text-lg text-red-600">
                            {formatPrice(product?.sale_price)}
                          </p>
                          <p className=" font-medium text-sm text-blue-600 line-through">
                            {formatPrice(product.filter_price || "")}
                          </p>
                        </div>
                      ) : (
                        priceData && (
                          <div className=" mt-1 line-clamp-1">
                            <p className=" font-medium  text-red-600">
                              {formatPrice(priceData.price.regular_price)}
                            </p>
                          </div>
                        )
                      )}

                      <div className="ml-4 border-l text-muted-foreground border-gray-300 pl-4 font-semibold text-xs mt-2">
                        SKU : {product?.sku}
                      </div>
                    </div>
                    {product?.brand.images.logo ? (
                      <div className="flex items-center mt-2">
                        <Link href={`/brand/${product.brand.slug}`}>
                          <Image
                            src={product?.brand.images.logo}
                            height={55}
                            width={55}
                            alt={product.brand.name}
                            className="border rounded-xl hover:shadow transition"
                          />
                        </Link>
                      </div>
                    ) : null}

                    <div className="mt-4 space-y-6">
                      <Separator />

                      <div
                        className="text-sm text-slate-700"
                        dangerouslySetInnerHTML={{
                          __html: product?.short_description ?? "",
                        }}
                      />
                    </div>
                    <div className="mt-4 space-y-6">
                      <Separator />

                      <div className="flex items-center gap-3">
                        <div className="flex gap-2 items-center">
                          <Button
                            size={"icon"}
                            variant={"outline"}
                            className="border-primary"
                          >
                            <MinusIcon className="w-4 h-4" />
                          </Button>
                          <p className="mx-1">1</p>
                          <Button size={"icon"}>
                            <PlusIcon className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button className="w-full">
                          <Icons.addToCart className="w-5 h-5 me-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>

                    {/* <div className="mt-6 flex items-center">
                  <Check
                    aria-hidden="true"
                    className="h-5 w-5 flex-shrink-0 text-green-500"
                  />
                  <p className="ml-2 text-sm text-muted-foreground">
                    Eligible for instant delivery
                  </p>
                </div> */}
                  </section>
                </div>
              </div>
            </div>

            <div className="mt-4 border-l col-span-4 px-4">
              <div>
                {" "}
                <div className="flex gap-x-3 items-center mb-3">
                  <Image
                    src={
                      "https://www.lifepharmacy.com/images/svg/ecommerce-gift.svg"
                    }
                    height={25}
                    width={25}
                    alt="gift"
                  />
                  <div className="flex flex-col gap-0 5">
                  <p className="text-primary font-semibold text-sm">Free Delivery</p>
                  <p className="text-accent-foreground text-xs">
                  For all orders over AED 29
                  </p>

                  </div>
                </div>
                <Separator />
              </div>
            </div>

            {/* Product images */}

            {/* add to cart part */}
            {/* <div className="mt-10 lg:col-start-1 lg:row-start-2 lg:max-w-lg lg:self-start">
            <div>
              <div className="mt-10">
                <AddToCartButton product={product} />
              </div>
              <div className="mt-6 text-center">
                <div className="group inline-flex text-sm text-medium">
                  <Shield
                    aria-hidden="true"
                    className="mr-2 h-5 w-5 flex-shrink-0 text-gray-400"
                  />
                  <span className="text-muted-foreground hover:text-gray-700">
                    30 Day Return Guarantee
                  </span>
                </div>
              </div>
            </div>
          </div> */}
          </div>
        </div>
      </MaxWidthWrapper>
    )
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  query,
  locale,
  params,
}) => {
  const queryClient = new QueryClient();

  await queryClient.fetchQuery({
    queryKey: ["get-product", params?.product, locale],
    queryFn: async () => {
      const data = await getProduct({
        slug: params?.product as string,
        locale: locale as locale,
      });
      return data as SingleProductProps;
    },
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      slug: params?.product,
      locale: locale as locale,
    },
  };
};
