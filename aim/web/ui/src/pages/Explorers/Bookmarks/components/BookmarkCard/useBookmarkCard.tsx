import React from 'react';

import { IBookmarkCardProps } from './BookmarkCard.d';

export function useBookmarkCard({
  id,
  select,
  onBookmarkDelete,
}: Pick<IBookmarkCardProps, 'id' | 'select' | 'onBookmarkDelete'>) {
  const [openModal, setOpenModal] = React.useState<boolean>(false);

  function handleOpenModal(): void {
    setOpenModal(true);
  }
  function handleCloseModal(): void {
    setOpenModal(false);
  }

  function handleBookmarkDelete(): void {
    onBookmarkDelete(id);
  }

  const tags: { label: string }[] = React.useMemo(() => {
    return select?.options?.map((val: any) => ({ label: val.label })) || [];
  }, [select]);

  return {
    tags,
    openModal,
    handleOpenModal,
    handleCloseModal,
    handleBookmarkDelete,
  };
}
