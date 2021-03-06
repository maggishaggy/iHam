module.exports = function Hog_state() {

  this.current_level = '';
  this.hogs = undefined;
  this.number_species = 0;
  this.removed_hogs = [];

  const that = this;

  this.reset_on = function (tree, per_species3, tax_name, threshold, fam_data) {
    that.current_level = tax_name;
    that.hogs = undefined;
    that.number_species = 0;
    that.removed_hogs = [];


    const leaves = tree.root().get_all_leaves(true);

    for (let i = 0; i < leaves.length; i++) {

      if (per_species3[leaves[i].property('name')] !== undefined && per_species3[leaves[i].property('name')][tax_name] !== undefined) {

        const slice = per_species3[leaves[i].property('name')][tax_name];

        if (slice && slice.length > 0) {
          that.number_species += 1;
          that.add_genes(slice);
        }
      }
    }

    if (that.hogs !== undefined) {
      for (let i = 0; i < that.hogs.length; i++) {
        const cov = that.hogs[i].number_species * 100 / that.number_species;
        if (cov >= threshold) {
          that.hogs[i].coverage = cov;
        }
        else {
          that.removed_hogs.push(i);
        }
      }

      for (let i = that.removed_hogs.length - 1; i >= 0; i--) {
        that.hogs.splice(that.removed_hogs[i], 1);
      }
    }

    let genes_so_far = 0;
    if (that.hogs) {
      for (let i = 0; i < that.hogs.length; i++) {
        that.hogs[i].hog_start = genes_so_far;
        const protid = get_protid_for_genes(fam_data, that.hogs[i].genes);
        if (protid) {
          that.hogs[i].protid = protid;
        }
        genes_so_far += that.hogs[i].max_in_hog;
      }
    }

    return that.removed_hogs;
  };

  this.add_genes = function (array_hogs_with_genes) {
    if (!that.hogs) {
      that.hogs = [];
      for (let i = 0; i < array_hogs_with_genes.length; i++) {
        const h = {
          genes: [],
          name: `hog_${i}`,
          number_species: 0,
          max_in_hog: 0,
          coverage: 0,
          hog_pos: i,
          total_hogs: array_hogs_with_genes.length
        };

        that.hogs.push(h);
      }
    }

    for (let i = 0; i < array_hogs_with_genes.length; i++) {
      if (array_hogs_with_genes[i].length > 0) {
        that.hogs[i].genes = that.hogs[i].genes.concat(array_hogs_with_genes[i]);
        that.hogs[i].number_species += 1;
        if (that.hogs[i].max_in_hog < array_hogs_with_genes[i].length) {
          that.hogs[i].max_in_hog = array_hogs_with_genes[i].length
        }
      }
    }
  }
};

function get_protid_for_genes(fam_data, genes) {
  if (!genes || !genes.length) {
    return;
  }

  for (let i=0; i<genes.length; i++) {
    if (fam_data[genes[i]]) {
      return fam_data[genes[i]].protid;
    }
  }
}