import unittest

from types import SimpleNamespace
from unittest import mock

from aim.ext import utils


class TestInstalledPackages(unittest.TestCase):
    def setUp(self):
        utils._collect_installed_package_versions.cache_clear()

    def tearDown(self):
        utils._collect_installed_package_versions.cache_clear()

    @mock.patch('aim.ext.utils._get_installed_distributions')
    def test_get_installed_packages(self, mock_installed_distributions):
        mock_installed_distributions.return_value = [
            SimpleNamespace(metadata={'Name': 'Example_Package', 'Version': '1.2.3'}),
            SimpleNamespace(metadata={'Version': '2.0.0'}),
            SimpleNamespace(metadata={'Name': 'missing-version'}),
        ]

        packages = utils.get_installed_packages()
        packages['changed-by-caller'] = '1.0'

        self.assertEqual(
            {'example-package': '1.2.3'},
            utils.get_installed_packages(),
        )
        mock_installed_distributions.assert_called_once_with()
