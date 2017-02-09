import ol from 'openlayers';

export class ChangeLayerControl extends ol.control.Control {

  handleChangeLayer(e) {
    e.preventDefault();
    var panel = e.target.nextElementSibling;
    panel.style.visibility = panel.style.visibility === "visible" ? "hidden" : "visible";

    // Swap button text
    e.target.innerHTML = e.target.innerHTML === "+" ? "−" : "+";
  };

  handleUpdateMap = (e) => {
    e.preventDefault();
    this.options.updateMapFc(this.selectedId, this.selectedWKT);
  };

  handleChangeRadio = (e) => {
    e.preventDefault();
    this.selectedId = Number(e.target.id);
  };

  handleChangeSelect = (e) => {
    e.preventDefault();
    this.selectedWKT = e.target.value;
  };

  constructor(opt_options) {
    super(opt_options);

    this.options = opt_options || {};

    this.selectedId = this.options.selectedLayer;
    this.selectedWKT = this.options.selectedWKT;

    this.renderContents();

    ol.inherits(this, ol.control.Control);
    

  }

  renderContents = () => {
    var button = document.createElement('button');
    button.innerHTML = '+';


    button.addEventListener('click', this.handleChangeLayer, false);
    button.addEventListener('touchstart', this.handleChangeLayer, false);

    var element = document.createElement('div');
    element.className = 'ol-changelayer ol-unselectable ol-control';
    element.appendChild(button);

    var optionPanel = document.createElement('div');
    optionPanel.className = 'ol-changelayerPanel ol-unselectable ol-control';

    var titleDiv = document.createElement('div');
    titleDiv.className = 'ol-changelayerPanel__Title';
    titleDiv.innerHTML = "Map options";
    optionPanel.appendChild(titleDiv);

    // If we have Layer Options to include
    if (this.options.values && this.options.values.length > 0) {
      var section = document.createElement('div');
      section.className = 'ol-changelayerPanel__Section';

      var titleLayerOptions = document.createElement('div');
      titleLayerOptions.className = 'ol-changelayerPanel__SelectLayer';
      titleLayerOptions.innerHTML = "Layer:";
      section.appendChild(titleLayerOptions);

      var ul = document.createElement('ul');
      ul.className = 'ol-changelayerPanel__list';


      this.options.values.forEach((item) => {

        var li = document.createElement('li');
        var input = document.createElement('input');
        input.type = "radio";
        input.id = item.id;
        input.name = "mapOptions";
        if (item.default && item.default === true) {
          input.checked = true;
          this.selectedId = item.id;
        }
        input.addEventListener('change', this.handleChangeRadio, false);
        li.appendChild(input);
        var label = document.createElement('label');
        label.htmlFor = item.id;
        label.innerHTML = item.value;
        li.appendChild(label);

        ul.appendChild(li);
      });
      section.appendChild(ul);

      optionPanel.appendChild(section);
    }

    // If we have Land Registry Number
    if (this.options.wktsNumbers && this.options.wktsNumbers.length > 0) {
      var section = document.createElement('div');
      section.className = 'ol-changelayerPanel__Section';

      var titleLandOptions = document.createElement('div');
      titleLandOptions.className = 'ol-changelayerPanel__SectionSelect';
      titleLandOptions.innerHTML = "WKT Number:";
      section.appendChild(titleLandOptions);

      var selectList = document.createElement("select");
      selectList.id = "wktsNumbers";
      selectList.addEventListener('change', this.handleChangeSelect, false);

      this.options.wktsNumbers.forEach((item) => {
        var option = document.createElement("option");
        option.value = item.key;
        option.text = item.key;
        if (item.selected === true) {
          option.selected = true;
        }
        selectList.appendChild(option);
      })
      section.appendChild(selectList);

      optionPanel.appendChild(section);
    }


    var button = document.createElement('button');
    button.className = 'ol-changelayerPanel__button';
    button.innerHTML = "Update map";
    button.addEventListener('click', this.handleUpdateMap, false);
    optionPanel.appendChild(button);


    element.appendChild(optionPanel);

    ol.control.Control.call(this, {
      element: element,
      target: this.options.target
    });
  }
}
