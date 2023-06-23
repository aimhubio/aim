import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { useResizeObserver } from 'hooks';

import { IconBrandPython } from '@tabler/icons-react';

import { Box, Tree, Icon, Text } from 'components/kit_v2';

import { PathEnum } from 'config/enums/routesEnum';

import pyodideEngine from 'services/pyodide/store';

import { AppSidebarNode, AppSidebarProps } from '../App.d';
import { BoardLink } from '../App.style';

const AppSidebar: React.FC<any> = ({
  boards,
  pages,
  editMode,
}: AppSidebarProps) => {
  const location = useLocation();
  const sidebarRef = React.useRef<any>(null);
  const [height, setHeight] = React.useState<number>(0);

  const treeData = React.useMemo((): {
    tree: AppSidebarNode[];
    expandedKeys: string[];
    selectedKeys: string[];
  } => {
    let tree: AppSidebarNode[] = [];
    let expandedKeys: string[] = [];
    let selectedKeys: string[] = [];
    let lookup: Record<string, AppSidebarNode> = {};

    function iterateOverPages(pages: Record<string, any>, prefix: string = '') {
      for (let name in pages) {
        if (typeof pages[name] === 'object') {
          let node: AppSidebarNode = {
            title: <Text>{name}</Text>,
            key: prefix + name,
            value: name,
          };

          tree.push(node);
          iterateOverPages(pages[name], prefix + name + '/');
        } else {
          const boardPath = `${PathEnum.App}/${pages[name]}`;
          const isActive = location.pathname.replace('/edit', '') === boardPath;

          let key = boardPath;

          if (isActive) {
            expandedKeys.push(key);
            selectedKeys.push(key);
          }

          let node: AppSidebarNode = {
            title: (
              <BoardLink to={`${boardPath}${editMode ? '/edit' : ''}`}>
                <Text css={{ ml: '$4' }}>{name}</Text>
              </BoardLink>
            ),
            key: key,
            value: name,
          };

          tree.push(node);
        }
      }
    }

    if (pages) {
      iterateOverPages(pages);
    } else {
      // Step 1: Create nodes and build a lookup
      for (let i = 0; i < boards.length; i++) {
        const boardPath = `${PathEnum.App}/${boards[i]}`;
        const isActive = location.pathname.replace('/edit', '') === boardPath;
        let path = boards[i].split('/');
        for (let j = 0; j < path.length; j++) {
          const isLast = j === path.length - 1;
          let part = path.slice(0, j + 1).join('/');
          if (isActive) {
            expandedKeys.push(`${i}-${j}`);
            if (isLast) {
              selectedKeys.push(`${i}-${j}`);
            }
          }
          if (!lookup[part]) {
            let node: AppSidebarNode = {
              title: isLast ? (
                <BoardLink
                  key={path[j]}
                  to={`${boardPath}${editMode ? '/edit' : ''}`}
                >
                  <Icon size='md' icon={<IconBrandPython />} />
                  <Text css={{ ml: '$4' }}>{path[j]}</Text>
                </BoardLink>
              ) : (
                <Text>{path[j]}</Text>
              ),
              value: path[j],
              key: `${i}-${j}`,
              ...(!isLast && { children: [] }),
            };
            lookup[part] = node;
          }
        }
      }

      // Step 2: Build the tree
      for (let path in lookup) {
        let node = lookup[path];
        if (path.indexOf('/') !== -1) {
          let parentPath = path.substring(0, path.lastIndexOf('/'));
          lookup[parentPath].children?.push(node);
        } else {
          tree.push(node);
        }
      }
    }
    return { tree, expandedKeys, selectedKeys };
  }, [boards, pages, editMode, location.pathname]);

  React.useEffect(() => {
    const unsubscribe = pyodideEngine.events.on('pages', (pagesData) => {
      // TODO: update pages dynamically
    });

    return () => {
      unsubscribe();
    };
  });

  const resizeObserverCallback = React.useCallback(
    (entries: ResizeObserverEntry[]) => {
      setHeight(entries[0].contentRect.height);
    },
    [],
  );

  useResizeObserver(resizeObserverCallback, sidebarRef);

  return (
    <Box
      ref={sidebarRef}
      width={200}
      css={{
        borderRight: '1px solid $border30',
        backgroundColor: '#fff',
        p: '$3 $4',
      }}
    >
      <Tree
        height={height}
        selectedKeys={treeData.selectedKeys}
        expandedKeys={treeData.expandedKeys}
        data={treeData.tree}
      />
    </Box>
  );
};

export default AppSidebar;
