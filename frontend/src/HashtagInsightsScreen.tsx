import { useParams } from 'react-router-dom';
import { Brand, Post } from './sharedDataModel';
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './components/ui/table';
import { useMemo, useState } from 'react';
import { Button } from './components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import { ID } from 'jazz-tools';
import { useCoState } from './main';

type Row = {
  hashtag: string;
  noOfPosts: number;
  combinedReach: number;
  relativeReachQuality: number;
  avgEngagement: number;
};

const columns: ColumnDef<Row>[] = [
  {
    accessorKey: 'hashtag',
    header: 'Hashtag',
  },
  {
    accessorKey: 'noOfPosts',
    header: 'No of posts',
  },
  {
    accessorKey: 'combinedReach',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Combined Reach
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'relativeReachQuality',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          "Relative reach quality"
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) =>
      (row.getValue('relativeReachQuality') as number).toFixed(2),
  },
  {
    accessorKey: 'avgEngagement',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Avg Engagement
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) =>
      (row.getValue('relativeReachQuality') as number).toFixed(2) + '%',
  },
];

export function HashtagInsightsScreen() {
  const brandId = useParams<{ brandId: ID<Brand> }>().brandId;

  const brand = useCoState(Brand, brandId);

  const rows: Row[] = useMemo(
    () => (brand ? collectHashtagRows(brand) : []),
    [brand]
  );

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'relativeReachQuality', desc: true },
  ]);

  const table = useReactTable<Row>({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <Table className="max-w-[70rem] mx-auto max-h-auto">
      <TableHeader className="sticky top-0 bg-stone-950">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && 'selected'}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
function collectHashtagRows(brand: Brand) {
  const hashtagsAndTheirPosts: { [hashtag: string]: Post[] } = {};

  for (const post of brand?.posts || []) {
    if (!post?.content) continue;
    const hashtags = post.content.match(/#[a-zA-Z0-9]+/g) || [];

    for (const hashtag of hashtags) {
      if (!hashtagsAndTheirPosts[hashtag]) {
        hashtagsAndTheirPosts[hashtag] = [];
      }

      hashtagsAndTheirPosts[hashtag].push(post);
    }
  }

  const hashtagsAndCombinedReach: { [hashtag: string]: number } =
    Object.fromEntries(
      Object.entries(hashtagsAndTheirPosts).map(([hashtag, posts]) => [
        hashtag,
        posts.reduce(
          (acc, post) => acc + (post?.instagramInsights?.reach || 0),
          0
        ),
      ])
    );

  // Hashtag quality is defined as: avg reach per post with that hashtag / avg reach per post without that hashtag
  const hashtagsAndTheirQuality: [hashtag: string, number][] = Object.entries(
    hashtagsAndCombinedReach
  ).map(([hashtag, combinedReach]) => {
    const avgReachWithHashtag =
      combinedReach / hashtagsAndTheirPosts[hashtag].length;
    const postsWithoutThatHashtag =
      brand?.posts?.filter((post) => !post?.content?.includes(hashtag)) || [];
    const combinedReachWithoutHashtag = postsWithoutThatHashtag.reduce(
      (acc, post) => acc + (post?.instagramInsights?.reach || 0),
      0
    );
    const avgReachWithoutHashtag =
      combinedReachWithoutHashtag / postsWithoutThatHashtag.length;
    return [hashtag, avgReachWithHashtag / avgReachWithoutHashtag] as const;
  });

  const hashtagsAndTheirAvgEngagement: { [hashtag: string]: number } =
    Object.fromEntries(
      Object.entries(hashtagsAndTheirPosts).map(([hashtag, posts]) => [
        hashtag,
        (100 *
          posts.reduce(
            (acc, post) =>
              acc +
              (post?.instagramInsights?.totalInteractions || 0) /
                (post?.instagramInsights?.reach || 1),
            0
          )) /
          posts.length,
      ])
    );

  const rows: Row[] = hashtagsAndTheirQuality.map(([hashtag, quality]) => ({
    hashtag,
    noOfPosts: hashtagsAndTheirPosts[hashtag].length,
    combinedReach: hashtagsAndCombinedReach[hashtag],
    relativeReachQuality: quality,
    avgEngagement: hashtagsAndTheirAvgEngagement[hashtag],
  }));
  return rows;
}
