from aim.sdk.run import Run
from tests.base import TestBase


class TestRunCreationChecks(TestBase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        run = Run(system_tracking_interval=None, log_system_params=False, capture_terminal_logs=False)
        cls.existing_run_hash = run.hash

    def test_reopen_existing_run_in_write_mode(self):
        run = Run(
            self.existing_run_hash, system_tracking_interval=None, log_system_params=False, capture_terminal_logs=False
        )
        self.assertEqual(run.hash, self.existing_run_hash)

    def test_reopen_existing_run_in_read_mode(self):
        run = Run(self.existing_run_hash, read_only=True)
        self.assertEqual(run.hash, self.existing_run_hash)

    # TODO [deprecation] Uncomment the line below
    # def test_open_non_existing_run_raises_error(self):
    #     from aim.sdk.errors import MissingRunError
    #     with self.assertRaises(MissingRunError):
    #         non_existing_run_hash = '111111111111000000000000'
    #         Run(non_existing_run_hash)
