/**
 * Tree Utilities
 * Helper functions for building and manipulating tree structures
 */

export interface TreeNode<T = any> {
  key: string;
  data: T;
  children?: TreeNode<T>[];
  parent?: TreeNode<T>;
}

/**
 * Build tree structure from flat array
 * @param items - Flat array of items
 * @param options - Configuration options
 * @returns Array of root tree nodes
 */
export function buildTree<T extends { id: string; parent_id?: string | null }>(
  items: T[],
  options: {
    idKey?: keyof T;
    parentIdKey?: keyof T;
    sortBy?: keyof T;
  } = {}
): TreeNode<T>[] {
  const {
    idKey = 'id' as keyof T,
    parentIdKey = 'parent_id' as keyof T,
    sortBy,
  } = options;

  // Create map for quick lookup
  const itemMap = new Map<string, TreeNode<T>>();
  const rootNodes: TreeNode<T>[] = [];

  // First pass: Create all nodes
  items.forEach((item) => {
    const node: TreeNode<T> = {
      key: String(item[idKey]),
      data: item,
      children: [],
    };
    itemMap.set(node.key, node);
  });

  // Second pass: Build tree structure
  items.forEach((item) => {
    const node = itemMap.get(String(item[idKey]))!;
    const parentId = item[parentIdKey] as string | null | undefined;

    if (parentId && itemMap.has(parentId)) {
      // Has parent - add to parent's children
      const parentNode = itemMap.get(parentId)!;
      parentNode.children!.push(node);
      node.parent = parentNode;
    } else {
      // No parent - root node
      rootNodes.push(node);
    }
  });

  // Sort if needed
  if (sortBy) {
    const sortFn = (a: TreeNode<T>, b: TreeNode<T>) => {
      const aVal = a.data[sortBy];
      const bVal = b.data[sortBy];
      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
      return 0;
    };

    const sortTree = (nodes: TreeNode<T>[]) => {
      nodes.sort(sortFn);
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          sortTree(node.children);
        }
      });
    };

    sortTree(rootNodes);
  }

  return rootNodes;
}

/**
 * Flatten tree structure back to array
 * @param nodes - Array of tree nodes
 * @returns Flat array of items
 */
export function flattenTree<T>(nodes: TreeNode<T>[]): T[] {
  const result: T[] = [];

  const traverse = (node: TreeNode<T>) => {
    result.push(node.data);
    if (node.children) {
      node.children.forEach(traverse);
    }
  };

  nodes.forEach(traverse);
  return result;
}

/**
 * Get all descendants of a node
 * @param node - Tree node
 * @returns Array of all descendant nodes
 */
export function getDescendants<T>(node: TreeNode<T>): TreeNode<T>[] {
  const descendants: TreeNode<T>[] = [];

  const traverse = (n: TreeNode<T>) => {
    if (n.children) {
      n.children.forEach((child) => {
        descendants.push(child);
        traverse(child);
      });
    }
  };

  traverse(node);
  return descendants;
}

/**
 * Get path from root to node
 * @param node - Tree node
 * @returns Array of nodes from root to target
 */
export function getNodePath<T>(node: TreeNode<T>): TreeNode<T>[] {
  const path: TreeNode<T>[] = [];
  let current: TreeNode<T> | undefined = node;

  while (current) {
    path.unshift(current);
    current = current.parent;
  }

  return path;
}
