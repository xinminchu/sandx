"""sandx engine: pure-Python entity resolution (ERBOT core pipeline port)."""
from .blocking import block
from .similarity import sim_value, pair_sims, combine
from .cluster import threshold_cc, louvain
from .evaluate import adjusted_rand
from .pipeline import run
from .rcode import r_script

__all__ = [
    "block", "sim_value", "pair_sims", "combine",
    "threshold_cc", "louvain", "adjusted_rand", "run", "r_script",
]
