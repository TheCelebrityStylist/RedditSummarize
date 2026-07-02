export function ErrorMessage({ title = 'Something went wrong', message }: { title?: string; message: string }) {
  return <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800"><strong>{title}</strong><p className="mt-1 text-sm">{message}</p></div>
}
