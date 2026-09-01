<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
require_once(APPPATH ."controllers/base/front_base".EXT);

class editor extends front_base {

	public function __construct()
	{
		parent::__construct();
		$this->load->model('editorsmodel', 'editorsmodel');
	}


	public function editors_pick()
	{
		$seq = (int) $this->input->get('seq');

		$editors = $this->editorsmodel->getEditorsPickList();

		$current_editor = [];
		foreach ($editors as $editor) {
			if ($editor['editor_seq'] === $seq) {
				$current_editor = [$editor];
				break;
			}
		}
		if (empty($current_editor) && !empty($editors)) {
			$current_editor = [$editors[0]];
		}

		$editorsJson = json_encode(
			$editors,
			JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE
		);

		$this->template->assign(array(
			'editors'        => $editors,
			'current_editor' => $current_editor,
			'current_seq'    => empty($current_editor) ? 0 : $current_editor[0]['editor_seq'],
			'editors_json'   => [['json' => $editorsJson]],
		));
		$this->print_layout($this->template_path());
	}
}