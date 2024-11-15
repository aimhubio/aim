from aim.sdk.run import Run
from aim.storage.context import Context
from tests.base import TestBase


class TestRunSequenceHomogeneousValues(TestBase):
    def test_different_types_on_different_contexts_and_runs(self):
        run = Run(system_tracking_interval=None)
        # same sequence name, different contexts
        run.track(1.0, name='numbers', context={'type': 'float'})
        run.track(1, name='numbers', context={'type': 'integer'})

        run2 = Run(system_tracking_interval=None)
        # same sequence name, different runs
        run2.track(1, name='numbers', context={'type': 'float'})

    def test_incompatible_type_during_tracking(self):
        run = Run(system_tracking_interval=None)
        run.track(1.0, name='numbers', context={})
        with self.assertRaises(ValueError) as cm:
            run.track([1], name='numbers', context={})
        exception = cm.exception
        self.assertEqual("Cannot log value '[1]' on sequence 'numbers'. Incompatible data types.", exception.args[0])

    def test_track_metrics_dict(self):
        run = Run(system_tracking_interval=None)
        empty_context_idx = Context({}).idx
        for index in range(10):
            run.track({'numbers': index, 'squares': index**2})
        metric_infos = run.meta_run_tree.subtree(('traces', empty_context_idx))
        self.assertEqual('int', metric_infos['numbers', 'dtype'])
        self.assertEqual('int', metric_infos['squares', 'dtype'])
        self.assertEqual(9, metric_infos['numbers', 'last'])
        self.assertEqual(81, metric_infos['squares', 'last'])

    def test_track_dicts_name_requirements(self):
        run = Run(system_tracking_interval=None)
        with self.assertRaises(ValueError) as cm:
            run.track({'number': 1}, name='number')
        exception = cm.exception
        self.assertEqual("'name' should be None when tracking values dictionary.", exception.args[0])

        with self.assertRaises(ValueError) as cm:
            run.track(1)
        exception = cm.exception
        self.assertEqual("'name' should not be None.", exception.args[0])

    def test_incompatible_type_after_tracking_restart(self):
        run = Run(system_tracking_interval=None)
        run_hash = run.hash
        run.track(1.0, name='numbers', context={})
        run.finalize()
        del run

        new_run = Run(run_hash=run_hash, system_tracking_interval=None)
        with self.assertRaises(ValueError) as cm:
            new_run.track([1], name='numbers', context={})
        exception = cm.exception
        self.assertEqual("Cannot log value '[1]' on sequence 'numbers'. Incompatible data types.", exception.args[0])

    def test_type_compatibility_for_empty_list(self):
        run = Run(system_tracking_interval=None)
        context = {}
        ctx = Context(context)
        seq_name = 'obj_list'

        sequence_info = run.meta_run_tree.subtree(('traces', ctx.idx, seq_name))
        typed_sequences_info = run.meta_tree.subtree('traces_types')

        run.track([], name=seq_name, context=context)
        self.assertEqual('list', sequence_info['dtype'])
        self.assertEqual(1, typed_sequences_info['list', ctx.idx, seq_name])
        self.assertIsNone(typed_sequences_info.get(('list(float)', ctx.idx, seq_name), None))

        run.track([], name=seq_name, context=context)
        self.assertEqual('list', sequence_info['dtype'])
        self.assertIsNone(typed_sequences_info.get(('list(float)', ctx.idx, seq_name), None))

        run.track([1.0], name=seq_name, context=context)
        self.assertEqual('list(float)', sequence_info['dtype'])
        self.assertEqual(1, typed_sequences_info['list(float)', ctx.idx, seq_name])

        run.track([], name=seq_name, context=context)
        self.assertEqual('list(float)', sequence_info['dtype'])

        with self.assertRaises(ValueError) as cm:
            run.track([5], name=seq_name, context=context)
        exception = cm.exception
        self.assertEqual(
            f"Cannot log value '{[5]}' on sequence '{seq_name}'. Incompatible data types.", exception.args[0]
        )

    def test_int_float_compatibility(self):
        run = Run(system_tracking_interval=None)

        # float first
        run.track(1.0, name='float numbers', context={})
        run.track(1, name='float numbers', context={})
        run.track(1.0, name='float numbers', context={})

        # int first
        run.track(1, name='int numbers', context={})
        run.track(1.0, name='int numbers', context={})
        run.track(1, name='int numbers', context={})
