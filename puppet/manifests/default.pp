vcsrepo { '/':
  ensure   => present,
  provider => git,
  source   => 'https://vostriak@bbpcode.epfl.ch/code/a/hpc/proposalreview.git', 
}
