import React, {Component} from 'react';
import ObjectTypeSelector from './ObjectTypeSelector';

export default class EditToolbar extends Component {

    handleItemSelect = (itemName) => {
        this.props.onObjectTypeSelect(itemName);
    };

    render() {
        let content = null;
        if (!this.props.editing) {
            content = <div className="snakView">
                <div className="snakView-value-container">
                    <div className="snakView-typeSelector"/>
                    <div className="snakView-body">
                        <div className="snakView-value">
                            <a href={'/resource/' + this.props.id}>
                                {this.props.text}
                            </a>
                        </div>
                        <div className="snakView-indicators"/>
                    </div>
                </div>
            </div>
        } else {
            const inputStyle = {height: "21.8px", overflow: "hidden", resize: "none"};
            const shouldShowQuotes = this.props.objectType === 'literal';
            content = <div className="snakView edit" aria-disabled="false">
                {
                    this.props.newProperty && <div className="snakView-property-container">
                        <div className="snakView-property" dir="auto">
                            <input placeholder="property" style={inputStyle}/>
                        </div>
                    </div>
                }
                <div className="snakView-value-container" dir="auto">
                    <ObjectTypeSelector onItemSelect={this.handleItemSelect} objectType={this.props.objectType}/>
                    {shouldShowQuotes && <div className="valueView-input-group-prepend">
                        <span className="valueView-input-group-text">&quot;</span>
                    </div>}
                    <div className="snakView-body">
                        <div className="snakView-value snakView-variation-valueSnak ">
                            <div className="valueView valueView-inEditMode">
                                <div className="valueView-value">
                                    <textarea className="valueView-input"
                                            defaultValue={this.props.text}
                                            style={inputStyle}
                                            onInput={this.props.onInput}>
                                    </textarea>
                                </div>
                            </div>
                        </div>
                        <div className="snakView-indicators"></div>
                    </div>
                    {shouldShowQuotes && <div className="valueView-input-group-prepend">
                        <span className="valueView-input-group-text">&quot;</span>
                    </div>}
                </div>
            </div>
        }

        return <div className="statementView-mainSnak">
            {content}
        </div>
    }

}