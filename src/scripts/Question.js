
export default class extends H5P.Question {

  constructor(...args) {
    super(...args);

    this.__super_attach = this.attach;
    delete this.attach;
  }

  attach() {
    return this.__super_attach.apply(this, arguments);
  }

}
