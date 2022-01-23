import os

from tests.base import TestBase
from tests.utils import remove_test_data

from aim.sdk import Run
from aim.storage.context import Context
from aim.storage.containertreeview import ContainerTreeView
from aim.storage.rockscontainer import RocksContainer


class TestRunContainerData(TestBase):
    def tearDown(self):
        remove_test_data()

    def test_meta_tree_contexts_and_names(self):
        train_context = {'subset': 'train'}
        val_context = {'subset': 'val'}
        empty_context = {}

        run = Run(repo=self.repo, system_tracking_interval=None)
        run.track(1.0, name='metric 1', context=train_context)
        run.track(1.0, name='metric 2', context=train_context)
        run.track(1.0, name='metric 1', context=val_context)
        run.track(1.0, name='metric 2', context=val_context)
        run.track(1.0, name='metric 3', context=val_context)
        run.track(0.0, name='metric')

        meta_container_path = os.path.join(self.repo.path, 'meta', 'chunks', run.hash)
        rc = RocksContainer(meta_container_path, read_only=True)
        tree = ContainerTreeView(rc)

        contexts = tree[('meta', 'contexts')]
        for ctx in [train_context, val_context, empty_context]:
            self.assertIn(Context(ctx).idx, contexts)
            self.assertDictEqual(contexts[Context(ctx).idx], ctx)

        self.assertSetEqual({'float'}, set(tree.view(('meta', 'traces_types')).keys()))
        metric_traces = tree.view(('meta', 'traces_types', 'float', Context(train_context).idx)).collect()
        self.assertSetEqual({'metric 1', 'metric 2'}, set(metric_traces.keys()))
        metric_traces = tree.view(('meta', 'traces_types', 'float', Context(val_context).idx)).collect()
        self.assertSetEqual({'metric 1', 'metric 2', 'metric 3'}, set(metric_traces.keys()))
        metric_traces = tree.view(('meta', 'traces_types', 'float', Context(empty_context).idx)).collect()
        self.assertSetEqual({'metric'}, set(metric_traces.keys()))

    def test_meta_run_tree_contexts_and_names(self):
        train_context = {'subset': 'train'}
        val_context = {'subset': 'val'}
        empty_context = {}

        run = Run(repo=self.repo, system_tracking_interval=None)
        run.track(1, name='metric 1', context=train_context)
        run.track(1, name='metric 2', context=train_context)
        run.track(1, name='metric 1', context=val_context)
        run.track(1, name='metric 2', context=val_context)
        run.track(1, name='metric 3', context=val_context)
        run.track(0, name='metric')

        meta_container_path = os.path.join(self.repo.path, 'meta', 'chunks', run.hash)
        rc = RocksContainer(meta_container_path, read_only=True)
        tree = ContainerTreeView(rc)

        contexts = tree.view(('meta', 'chunks', run.hash, 'contexts')).collect()
        for ctx in [train_context, val_context, empty_context]:
            self.assertIn(Context(ctx).idx, contexts)
            self.assertDictEqual(contexts[Context(ctx).idx], ctx)

        traces = tree.view(('meta', 'chunks', run.hash, 'traces', Context(train_context).idx)).collect()
        self.assertSetEqual({'metric 1', 'metric 2'}, set(traces.keys()))
        traces = tree.view(('meta', 'chunks', run.hash, 'traces', Context(val_context).idx)).collect()
        self.assertSetEqual({'metric 1', 'metric 2', 'metric 3'}, set(traces.keys()))
        traces = tree.view(('meta', 'chunks', run.hash, 'traces', Context(empty_context).idx)).collect()
        self.assertSetEqual({'metric'}, set(traces.keys()))

    def test_run_trace_dtype_and_last_value(self):
        run = Run()
        run.track(1.0, name='metric 1', context={})
        run.track(2.0, name='metric 1', context={})
        run.track(3.0, name='metric 1', context={})
        run.track(1.0, name='metric 1', context={'subset': 'train'})

        meta_container_path = os.path.join(self.repo.path, 'meta', 'chunks', run.hash)
        rc = RocksContainer(meta_container_path, read_only=True)
        tree = ContainerTreeView(rc)
        metric_1_dict = tree.view(('meta', 'chunks', run.hash, 'traces', Context({}).idx, 'metric 1')).collect()
        self.assertEqual(3.0, metric_1_dict['last'])
        self.assertEqual('float', metric_1_dict['dtype'])

        metric_1_dict = tree.view(('meta', 'chunks', run.hash, 'traces',
                                   Context({'subset': 'train'}).idx, 'metric 1')).collect()
        self.assertEqual(1.0, metric_1_dict['last'])

    def test_series_tree_values(self):
        # sequential steps
        run = Run()
        run.track(1.0, name='metric 1', context={})
        run.track(2.0, name='metric 1', context={})
        run.track(3.0, name='metric 1', context={})

        series_container_path = os.path.join(self.repo.path, 'seqs', 'chunks', run.hash)
        rc = RocksContainer(series_container_path, read_only=True)
        tree = ContainerTreeView(rc)
        traces_dict = tree.view(('seqs', 'chunks', run.hash, Context({}).idx, 'metric 1')).collect()
        self.assertSetEqual({'val', 'epoch', 'time'}, set(traces_dict.keys()))
        self.assertEqual(3, len(traces_dict['val']))
        self.assertEqual(3, len(traces_dict['epoch']))
        self.assertEqual(3, len(traces_dict['time']))
        self.assertEqual(1.0, traces_dict['val'][0])
        self.assertEqual(2.0, traces_dict['val'][1])
        self.assertEqual(3.0, traces_dict['val'][2])

        # user-specified steps
        run = Run()
        run.track(1.0, name='metric 1', step=10, context={})
        run.track(2.0, name='metric 1', step=20, context={})
        run.track(3.0, name='metric 1', step=30, context={})

        series_container_path = os.path.join(self.repo.path, 'seqs', 'chunks', run.hash)
        rc = RocksContainer(series_container_path, read_only=True)
        tree = ContainerTreeView(rc)
        traces_dict = tree.view(('seqs', 'chunks', run.hash, Context({}).idx, 'metric 1')).collect()
        self.assertEqual(31, len(traces_dict['val']))  # last index is 30
        # sparse array
        self.assertTrue(all(x is None for x in traces_dict['val'][0:10]))
        self.assertEqual(1.0, traces_dict['val'][10])
        self.assertTrue(all(x is None for x in traces_dict['val'][11:20]))
        self.assertEqual(2.0, traces_dict['val'][20])
        self.assertTrue(all(x is None for x in traces_dict['val'][21:30]))
        self.assertEqual(3.0, traces_dict['val'][30])
        val_array_view = tree.view(('seqs', 'chunks', run.hash, Context({}).idx, 'metric 1')).array('val')
        self.assertEqual(31, len(val_array_view))
        self.assertEqual(3, len(list(val_array_view)))
        self.assertEqual(1.0, val_array_view[10])
        self.assertEqual(2.0, val_array_view[20])
        self.assertEqual(3.0, val_array_view[30])

        # user-specified steps, unordered
        run = Run()
        run.track(3.0, name='metric 1', step=30, context={})
        run.track(1.0, name='metric 1', step=10, context={})
        run.track(2.0, name='metric 1', step=20, context={})

        series_container_path = os.path.join(self.repo.path, 'seqs', 'chunks', run.hash)
        rc = RocksContainer(series_container_path, read_only=True)
        tree = ContainerTreeView(rc)
        traces_dict = tree.view(('seqs', 'chunks', run.hash, Context({}).idx, 'metric 1')).collect()
        self.assertEqual(31, len(traces_dict['val']))  # last index is 30
        # sparse array
        self.assertTrue(all(x is None for x in traces_dict['val'][0:10]))
        self.assertEqual(1.0, traces_dict['val'][10])
        self.assertTrue(all(x is None for x in traces_dict['val'][11:20]))
        self.assertEqual(2.0, traces_dict['val'][20])
        self.assertTrue(all(x is None for x in traces_dict['val'][21:30]))
        self.assertEqual(3.0, traces_dict['val'][30])

    def test_run_set_param_meta_tree(self):
        run = Run()
        run['p1'] = 1
        run['p2'] = {'foo': 'bar'}
        run['p3'] = 0.0
        run['p4'] = True
        run['p5'] = ['x', 1, 2]
        run['p6'] = None
        run['p7'] = 'bazե\x00a-a'
        run['p8'] = b'blob'

        meta_container_path = os.path.join(self.repo.path, 'meta', 'chunks', run.hash)
        rc = RocksContainer(meta_container_path, read_only=True)
        tree = ContainerTreeView(rc)
        meta_attrs_tree = tree.view(('meta', 'attrs'))
        meta_run_attrs_tree = tree.view(('meta', 'chunks', run.hash, 'attrs'))

        val = meta_attrs_tree['p1']
        self.assertEqual(int, type(val))
        self.assertEqual(1, val)

        val = meta_run_attrs_tree['p1']
        self.assertEqual(int, type(val))
        self.assertEqual(1, val)

        val = meta_attrs_tree['p3']
        self.assertEqual(float, type(val))
        self.assertEqual(0.0, val)

        val = meta_run_attrs_tree['p3']
        self.assertEqual(float, type(val))
        self.assertEqual(0.0, val)

        val = meta_attrs_tree['p4']
        self.assertEqual(bool, type(val))
        self.assertEqual(True, val)

        val = meta_run_attrs_tree['p4']
        self.assertEqual(bool, type(val))
        self.assertEqual(True, val)

        val = meta_attrs_tree['p2']
        self.assertEqual(dict, type(val))
        self.assertEqual({'foo': 'bar'}, val)

        val = meta_run_attrs_tree['p2']
        self.assertEqual(dict, type(val))
        self.assertEqual({'foo': 'bar'}, val)

        val = meta_attrs_tree['p5']
        self.assertEqual(list, type(val))
        self.assertEqual(['x', 1, 2], val)

        val = meta_run_attrs_tree['p5']
        self.assertEqual(list, type(val))
        self.assertEqual(['x', 1, 2], val)

        val = meta_attrs_tree['p6']
        self.assertEqual(None, val)

        val = meta_run_attrs_tree['p6']
        self.assertEqual(None, val)

        val = meta_attrs_tree['p7']
        self.assertEqual(str, type(val))
        self.assertEqual('bazե\x00a-a', val)

        val = meta_run_attrs_tree['p7']
        self.assertEqual(str, type(val))
        self.assertEqual('bazե\x00a-a', val)

        val = meta_attrs_tree['p8']
        self.assertEqual(bytes, type(val))
        self.assertEqual(b'blob', val)

        val = meta_run_attrs_tree['p8']
        self.assertEqual(bytes, type(val))
        self.assertEqual(b'blob', val)
