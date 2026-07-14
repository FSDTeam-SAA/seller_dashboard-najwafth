"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { Plus, Pencil, Trash2, Upload, X, Star, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Modal, ModalHeader, PageFrame } from "@/components/seller/primitives";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createBook, deleteBook, getCategories, getProfile, getSellerBooks, publishBooks, updateBook } from "@/lib/api";
import { cn, formatCurrency, getAssetUrl } from "@/lib/utils";

type Category = { _id: string; name: string };
type Book = {
  _id: string;
  title?: string;
  author?: string;
  price?: number;
  rating?: number;
  stock?: number | boolean;
  inStock?: boolean;
  description?: string;
  coverImage?: string;
  image?: { url?: string };
  category?: { _id?: string; name?: string };
};
type BooksResp = { books?: Book[]; meta?: { totalPage?: number } };
type Profile = { _id?: string };

const empty = {
  title: "",
  author: "",
  category: "",
  price: "",
  description: "",
  stock: "1",
};

function BookForm({
  initial,
  onCancel,
  onSubmit,
  isPending,
  title,
  subtitle,
  categories,
}: {
  initial: typeof empty & { coverImage?: string };
  onCancel: () => void;
  onSubmit: (form: typeof empty, file: File | null) => void;
  isPending: boolean;
  title: string;
  subtitle: string;
  categories: Category[];
}) {
  const [form, setForm] = useState(initial);
  const [file, setFile] = useState<File | null>(null);
  const preview = file ? URL.createObjectURL(file) : initial.coverImage;

  return (
    <>
      <ModalHeader title={title} subtitle={subtitle} onClose={onCancel} />
      <div className="grid gap-5 md:grid-cols-[260px_1fr]">
        <div>
          <p className="mb-2 text-[14px] font-medium text-[#202124]">Cover Image</p>
          <label className="relative flex aspect-[3/4] cursor-pointer items-center justify-center overflow-hidden rounded-[12px] border border-dashed border-[#3d8ef5]/40 bg-white">
            {preview ? <Image src={preview} alt="cover" fill className="object-cover" sizes="260px" /> : null}
            <div className="relative z-10 flex flex-col items-center text-center text-[#3d8ef5]">
              <Upload className="size-7" />
              <p className="mt-2 text-[14px] font-medium">Upload Picture</p>
              <p className="text-[11px] text-[#5b6371]">Recommended size: 800x1200px</p>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#202124]">Book Title *</label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Thinking, Fast and Slow" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-[14px] font-medium text-[#202124]">Author *</label>
              <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Daniel Kahneman" />
            </div>
            <div>
              <label className="mb-2 block text-[14px] font-medium text-[#202124]">Price ($) *</label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="22" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_140px] md:items-end">
            <div>
              <label className="mb-2 block text-[14px] font-medium text-[#202124]">Category</label>
              <select
                className="h-12 w-full rounded-[10px] border border-[#cfd4dc] bg-white px-4 text-[14px] text-[#202124]"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[14px] font-medium text-[#202124]">Quantity</label>
              <Input
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="10"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#202124]">Description</label>
            <textarea
              className="min-h-[120px] w-full rounded-[10px] border border-[#cfd4dc] bg-white px-4 py-3 text-[14px] text-[#202124]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="A book on behavioral psychology and decision-making."
            />
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button className="bg-[#6d98c0] hover:bg-[#5f88ae]" disabled={isPending} onClick={() => onSubmit(form, file)} type="button">
          {isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </>
  );
}

function BooksGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="h-[380px] rounded-[14px] border-[#e3e6ec] bg-white p-3 shadow-none" />
      ))}
    </div>
  );
}

export default function BooksPage() {
  const queryClient = useQueryClient();
  const [openAdd, setOpenAdd] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [openPublish, setOpenPublish] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const profileQuery = useQuery<Profile>({
    queryKey: ["seller-profile"],
    queryFn: getProfile,
  });
  const sellerId = profileQuery.data?._id;

  const booksQuery = useQuery<BooksResp>({
    queryKey: ["seller-books", sellerId],
    queryFn: () => getSellerBooks({ page: 1, limit: 24, shopId: sellerId }),
    enabled: !!sellerId,
  });
  const categoriesQuery = useQuery<Category[]>({
    queryKey: ["seller-categories"],
    queryFn: getCategories,
  });

  const books = booksQuery.data?.books || [];
  const categories = categoriesQuery.data || [];
  const isBooksLoading = profileQuery.isLoading || booksQuery.isLoading;

  const createMutation = useMutation({
    mutationFn: createBook,
    onSuccess: () => {
      toast.success("Book created.");
      queryClient.invalidateQueries({ queryKey: ["seller-books"] });
      setOpenAdd(false);
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> | FormData }) => updateBook(id, payload),
    onSuccess: () => {
      toast.success("Book updated.");
      queryClient.invalidateQueries({ queryKey: ["seller-books"] });
      setEditing(null);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteBook,
    onSuccess: () => {
      toast.success("Book deleted.");
      queryClient.invalidateQueries({ queryKey: ["seller-books"] });
    },
  });
  const publishMutation = useMutation({
    mutationFn: publishBooks,
    onSuccess: () => {
      toast.success("Books published.");
      queryClient.invalidateQueries({ queryKey: ["seller-books"] });
      setOpenPublish(false);
      setSelected(new Set());
    },
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submitForm = (form: typeof empty, file: File | null, id?: string) => {
    if (!form.title.trim() || !form.author.trim() || !form.price || !form.category) {
      toast.error("Title, author, category, and price are required.");
      return;
    }

    const stockQuantity = Number(form.stock);
    if (!form.stock || !Number.isInteger(stockQuantity) || stockQuantity < 0) {
      toast.error("Stock quantity must be a whole number.");
      return;
    }

    const fd = new FormData();
    fd.set("title", form.title);
    fd.set("author", form.author);
    fd.set("price", form.price);
    fd.set("description", form.description);
    if (form.category) fd.set("category", form.category);
    fd.set("stock", String(stockQuantity));
    if (file) fd.set("coverImage", file);

    if (id) {
      updateMutation.mutate({ id, payload: fd });
      return;
    }

    createMutation.mutate(fd);
  };

  return (
    <PageFrame
      title="Books Management"
      subtitle="Add, edit, and organize your book collection"
      action={
        <div className="flex gap-3">
          <Button className="bg-[#6d98c0] hover:bg-[#5f88ae]" onClick={() => setOpenAdd(true)}>
            <Plus className="size-4" /> Add New Book
          </Button>
          <Button variant="outline" onClick={() => setOpenPublish(true)} disabled={books.length === 0}>
            <Upload className="size-4" /> Published
          </Button>
        </div>
      }
    >
      {isBooksLoading ? <BooksGridSkeleton /> : null}

      {!isBooksLoading && books.length === 0 ? (
        <Card className="rounded-[18px] border-dashed border-[#cfd4dc] bg-white p-10 text-center shadow-none">
          <h2 className="text-[20px] font-semibold text-[#202124]">No books yet</h2>
          <p className="mt-2 text-[15px] text-[#5b6371]">Create books from seller dashboard and they will show here.</p>
          <div className="mt-6">
            <Button className="bg-[#6d98c0] hover:bg-[#5f88ae]" onClick={() => setOpenAdd(true)}>
              <Plus className="size-4" /> Add New Book
            </Button>
          </div>
        </Card>
      ) : null}

      {!booksQuery.isLoading && books.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {books.map((book) => {
            const cover = getAssetUrl(book.image || book.coverImage);
            const stockQuantity = typeof book.stock === "boolean" ? (book.stock ? 1 : 0) : Number(book.stock ?? (book.inStock ? 1 : 0));
            const inStock = stockQuantity > 0;

            return (
              <Card key={book._id} className="overflow-hidden rounded-[14px] border-[#e3e6ec] bg-white p-3 shadow-none">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] bg-[#e3e6ec]">
                  {cover ? <Image src={cover} alt={book.title || "Book"} fill className="object-cover" sizes="320px" /> : null}
                  <span className="absolute right-2 top-2 rounded-md bg-[#103670] px-2 py-1 text-[11px] font-semibold text-white">
                    {inStock ? `${stockQuantity} in stock` : "Stock out"}
                  </span>
                </div>
                <div className="mt-3 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[16px] font-semibold text-[#202124]">{book.title || "Untitled book"}</h3>
                    <span className="inline-flex items-center gap-0.5 text-[12px] text-[#f59e0b]">
                      <Star className="size-3.5 fill-current" /> {book.rating ?? 0}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#5b6371]">{book.author || "Unknown author"}</p>
                  <p className="flex items-center gap-1 text-[12px] text-[#5b6371]">
                    <MapPin className="size-3.5 text-[#3d8ef5]" /> {book.category?.name || "Uncategorized"}
                  </p>
                  <p className="text-[14px] font-semibold text-[#3d8ef5]">$ {(book.price ?? 0).toFixed(2)}</p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button variant="outline" className="border-[#3d8ef5] text-[#3d8ef5]" onClick={() => setEditing(book)}>
                    <Pencil className="size-4" /> Edit
                  </Button>
                  <Button className="bg-[#fde7e7] text-[#d92d20] hover:bg-[#fbd1d1]" onClick={() => deleteMutation.mutate(book._id)}>
                    <Trash2 className="size-4" /> Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}

      <Modal open={openAdd} onClose={() => setOpenAdd(false)} className="max-w-[820px]">
        <BookForm
          initial={{ ...empty }}
          onCancel={() => setOpenAdd(false)}
          onSubmit={(form, file) => submitForm(form, file)}
          isPending={createMutation.isPending}
          title="Add New Book"
          subtitle="Add a new book by filling in the required information"
          categories={categories}
        />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} className="max-w-[820px]">
        {editing ? (
          <BookForm
            initial={{
              title: editing.title || "",
              author: editing.author || "",
              category: editing.category?._id || "",
              price: String(editing.price ?? ""),
              description: editing.description || "",
              stock:
                typeof editing.stock === "boolean"
                  ? editing.stock
                    ? "1"
                    : "0"
                  : String(editing.stock ?? (editing.inStock ? 1 : 0)),
              coverImage: getAssetUrl(editing.image || editing.coverImage) || undefined,
            }}
            onCancel={() => setEditing(null)}
            onSubmit={(form, file) => submitForm(form, file, editing._id)}
            isPending={updateMutation.isPending}
            title="Edit Book"
            subtitle="Edit Book Information"
            categories={categories}
          />
        ) : null}
      </Modal>

      <Modal open={openPublish} onClose={() => setOpenPublish(false)} className="max-w-[1100px]">
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-[22px] font-semibold text-[#202124]">Select books to publish</h2>
          <button onClick={() => setOpenPublish(false)} type="button" className="text-[#5b6371]">
            <X className="size-5" />
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {books.map((book) => {
            const cover = getAssetUrl(book.image || book.coverImage);
            const isSelected = selected.has(book._id);

            return (
              <button
                key={book._id}
                onClick={() => toggleSelect(book._id)}
                className={cn(
                  "relative overflow-hidden rounded-[14px] border bg-white p-3 text-left transition",
                  isSelected ? "border-[#3d8ef5] ring-2 ring-[#3d8ef5]/30" : "border-[#e3e6ec]",
                )}
                type="button"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] bg-[#e3e6ec]">
                  {cover ? <Image src={cover} alt={book.title || ""} fill className="object-cover" sizes="240px" /> : null}
                </div>
                <h3 className="mt-2 text-[14px] font-semibold text-[#202124]">{book.title || "Untitled book"}</h3>
                <p className="text-[12px] text-[#5b6371]">{book.author || "Unknown author"}</p>
                <p className="mt-1 text-[14px] font-semibold text-[#3d8ef5]">{formatCurrency(book.price || 0)}</p>
                {isSelected ? (
                  <span className="absolute right-3 top-3 inline-flex size-6 items-center justify-center rounded-full bg-[#3d8ef5] text-white">+</span>
                ) : null}
              </button>
            );
          })}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpenPublish(false)}>
            Cancel
          </Button>
          <Button
            className="bg-[#6d98c0] hover:bg-[#5f88ae]"
            disabled={publishMutation.isPending || selected.size === 0}
            onClick={() => publishMutation.mutate(Array.from(selected))}
          >
            <Upload className="size-4" /> {publishMutation.isPending ? "Publishing..." : "Published"}
          </Button>
        </div>
      </Modal>
    </PageFrame>
  );
}
