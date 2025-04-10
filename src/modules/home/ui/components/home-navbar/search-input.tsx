'use client';

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_URL } from "@/constants";
import { SearchIcon, XIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

export const SearchInput = () => {
  return (
    <Suspense fallback={<Skeleton className="h-10 w-full" />}>
      <SearchInputSuspense />
    </Suspense>
  )
}

export const SearchInputSuspense = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const [value, setValue] = useState<string>(query);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const url = new URL('/search', APP_URL);
    const newQuery = value.trim();

    url.searchParams.set('query', encodeURIComponent(newQuery));

    if (categoryId) {
      url.searchParams.set('categoryId', categoryId);
    }

    if (newQuery === '') {
      url.searchParams.delete('query');
    }

    setValue(newQuery);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push(url.toString() as any);
  };

  return (
    <form className="flex w-full max-w-[600px]" onSubmit={handleSearch}>
      <div className="relative w-full">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type="text"
          placeholder="Pesquisar"
          className="w-full pl-4 py-2 pr-12 rounded-l-full border focus:outline-none focus:border-blue-500"
        // onChange={}
        />
        {
          value && (
            <Button
              type="button"
              variant='ghost'
              size='icon'
              onClick={() => {
                setValue('');
                const url = new URL('/search', APP_URL);
                url.searchParams.delete('query');
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                router.push(url.toString() as any);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
            >
              <XIcon className="text-gray-500" />
            </Button>
          )
        }
      </div>
      <button
        type="submit"
        disabled={!value.trim()}
        className="px-5 py-2.5 bg-gray-100 border border-l-0 rounded-r-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
        <SearchIcon className="size-5" />
      </button>
    </form>
  )
};