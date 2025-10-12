/**
 * Skeleton Loading Components
 * 
 * Reusable skeleton loaders that mimic the structure of actual content
 * to improve perceived performance during data fetching.
 * 
 * @example
 * ```tsx
 * {loading ? <ProjectCardSkeleton /> : <ProjectCard data={project} />}
 * ```
 */

import React from 'react';

/**
 * Utility function to merge className strings
 */
function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Base Skeleton component
 * Can be used to create custom skeleton shapes
 */
export function Skeleton({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-200 dark:bg-slate-800",
        className
      )}
      {...props}
    />
  );
}

/**
 * Skeleton for dashboard stat cards
 */
export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-8 w-12" />
        </div>
        <Skeleton className="h-12 w-12 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Skeleton for project cards in list view
 */
export function ProjectCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for project table rows
 */
export function ProjectTableRowSkeleton() {
  return (
    <tr className="border-b border-slate-200">
      <td className="py-4 px-4">
        <Skeleton className="h-5 w-48" />
      </td>
      <td className="py-4 px-4">
        <Skeleton className="h-5 w-32" />
      </td>
      <td className="py-4 px-4">
        <Skeleton className="h-6 w-24 rounded-full" />
      </td>
      <td className="py-4 px-4">
        <Skeleton className="h-5 w-20" />
      </td>
      <td className="py-4 px-4">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </td>
    </tr>
  );
}

/**
 * Full project table skeleton with header
 */
export function ProjectTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="text-left py-3 px-4">
              <Skeleton className="h-4 w-20" />
            </th>
            <th className="text-left py-3 px-4">
              <Skeleton className="h-4 w-16" />
            </th>
            <th className="text-left py-3 px-4">
              <Skeleton className="h-4 w-12" />
            </th>
            <th className="text-left py-3 px-4">
              <Skeleton className="h-4 w-24" />
            </th>
            <th className="text-left py-3 px-4">
              <Skeleton className="h-4 w-16" />
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <ProjectTableRowSkeleton key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Skeleton for chapter list items
 */
export function ChapterListItemSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      
      <div className="space-y-2 mb-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-5/6" />
      </div>
      
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
}

/**
 * Skeleton for outline view
 */
export function OutlineSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-5 w-5 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for project details page header
 */
export function ProjectHeaderSkeleton() {
  return (
    <div className="bg-white border-b border-slate-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded" />
          <Skeleton className="h-10 w-10 rounded" />
          <Skeleton className="h-10 w-10 rounded" />
        </div>
      </div>
      
      <div className="flex gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

/**
 * Skeleton for tab navigation
 */
export function TabsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-4 border-b border-slate-200 px-6">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-24 mb-[-1px]" />
      ))}
    </div>
  );
}

/**
 * Full page skeleton for project detail page
 */
export function ProjectDetailPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <ProjectHeaderSkeleton />
      <TabsSkeleton />
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for form inputs
 */
export function FormInputSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}

/**
 * Skeleton for text area
 */
export function TextAreaSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-32 w-full rounded-md" />
    </div>
  );
}
