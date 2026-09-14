"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { ProductForm, ProductFormValues } from "@/components/admin/product-form";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const [initial, setInitial] = useState<Partial<ProductFormValues> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<any>(`/api/admin/products/${params.id}`)
      .then((p) => {
        setInitial({
          name: p.name,
          sku: p.sku,
          categoryId: p.categoryId,
          brandId: p.brandId || "",
          description: p.description,
          shortDescription: p.shortDescription || "",
          price: String(p.price),
          salePrice: p.salePrice ? String(p.salePrice) : "",
          stockQuantity: String(p.stockQuantity),
          lowStockThreshold: String(p.lowStockThreshold),
          status: p.status,
          isFeatured: p.isFeatured,
          metaTitle: p.metaTitle || "",
          metaDescription: p.metaDescription || "",
          images: p.images.length ? p.images.map((i: any) => ({ url: i.url, altText: i.altText || "", isPrimary: i.isPrimary })) : [{ url: "", altText: "", isPrimary: true }],
        });
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text">Edit product</h1>
      <p className="mt-1 text-sm text-muted">Update details, pricing, stock or images.</p>
      <div className="mt-6 max-w-4xl">
        {loading && <p className="text-sm text-muted">Loading product…</p>}
        {!loading && initial && <ProductForm productId={params.id} initial={initial} />}
      </div>
    </div>
  );
}
