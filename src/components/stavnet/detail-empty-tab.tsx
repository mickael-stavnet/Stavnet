interface DetailEmptyTabProps {
  message: string;
  className?: string;
}

export function DetailEmptyTab({ message, className = "" }: DetailEmptyTabProps) {
  return (
    <div role="status" className={`flex min-h-[220px] w-full flex-1 items-center justify-center px-6 text-center text-[14px] leading-[1.45] text-[#315565] md:min-h-[300px] md:text-[16px] ${className}`}>
      <p className="max-w-[34rem]">{message}</p>
    </div>
  );
}
