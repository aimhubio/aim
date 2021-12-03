import React from 'react';
import classNames from 'classnames';

import { Icon, Text } from 'components/kit';

import { IMenuItemProps, IMenuItem } from './types';

/**
 * Generate key with id and parentId
 * @param parentId
 * @param id
 */
function generateKeyWithParent(parentId: string | number, id: string | number) {
  return (parentId ? parentId + '.' : '') + id;
}

/**
 * MenuItem
 * active key computed based on tree model (test1.test2.test3)
 * @param name
 * @param id
 * @param children
 * @param onClickOpen
 * @param parentId
 * @param activeItemKey
 */
function MenuItem({
  name,
  id,
  children,
  onClickOpen,
  parentId = '',
  activeItemKey,
}: IMenuItemProps) {
  const { isActive, isOpen } = React.useMemo(() => {
    /*
     * the fastest algorithm to have tree view is to identify the item with it's parent's ids
     *  if we have this type of tree
     *   layer1 -> layer2 -> layer3
     *   if the layer3 is active, the active key will be layer1.layer2.layer3
     *   if the layer2 is active, the active key will be layer1.layer2
     */
    const key = generateKeyWithParent(parentId, id);
    const active = key === activeItemKey || id === activeItemKey;
    const open = activeItemKey.toString().includes(`${key}.`);

    return {
      isActive: active,
      isOpen: open,
    };
  }, [activeItemKey, id, parentId, name]);

  const onClickItem = React.useCallback(
    (event) => {
      event.stopPropagation();
      event.stopPropagation();
      let key = generateKeyWithParent(parentId, id);
      let callbackName = name;
      // if the item has children, activate first child
      if (children?.length) {
        key += `.${children[0].id}`;
        callbackName = children[0].name;
      }

      // ensure that clicked item is not active yet
      if (key !== activeItemKey) {
        onClickOpen(key, callbackName);
      }
    },
    [onClickOpen, parentId, id, name, children, activeItemKey],
  );

  return (
    <div
      className={classNames({
        MenuItem: true,
        active: isActive,
      })}
      tabIndex={0}
    >
      <div
        className={classNames({
          MenuItemHead: true,
          layer1: !parentId,
          layer2: parentId,
          no_child: !children?.length,
          active: isActive,
          open: isOpen,
        })}
        onClick={onClickItem}
        role='button'
      >
        <div>
          <Text
            size={14}
            tint={isActive ? 100 : 80}
            weight={600}
            color={isActive ? 'info' : 'primary'}
          >
            {name}
          </Text>
          {children?.length && (
            <Icon
              name={isOpen || isActive ? 'arrow-up' : 'arrow-down'}
              fontSize={'0.75rem'}
              color={isOpen || isActive ? '#1C2852' : '#414B6D'}
            />
          )}
        </div>
      </div>
      {children?.length && (
        <div
          className={classNames({
            MenuItemBody: true,
            open: isOpen,
          })}
        >
          <div>
            {children?.map((item: IMenuItem) => (
              <MenuItem
                key={item.id}
                {...item}
                onClickOpen={onClickOpen}
                parentId={generateKeyWithParent(parentId, id)}
                activeItemKey={activeItemKey}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo<IMenuItemProps>(MenuItem);
